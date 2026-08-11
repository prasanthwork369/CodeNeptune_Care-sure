import { asError } from "@/src/api/errors";
import { useCart } from "@/src/hooks/queries/useCart";
import { useCreateOrder } from "@/src/hooks/mutations/useCreateOrder";
import { useDeliveryAddress } from "@/src/hooks/useDeliveryAddress";
import { orderNotification } from "@/src/services/notifications/orderNotification";
import {
  analyticsService,
  PERF_TRACES,
  reportError,
  usePerformanceTrace,
} from "@/src/services/firebase";
import { orderErrorMessage } from "@/src/utils/orderError";
import { useCheckoutDraftStore } from "@/src/store/checkoutDraftStore";
import { useCheckoutStore } from "@/src/store/checkoutStore";
import { useCouponStore } from "@/src/store/couponStore";
import { usePrescriptionOrderStore } from "@/src/store/prescriptionOrderStore";
import { requireInternet } from "@/src/utils/offline";
import { useNav } from "@/src/hooks/useNav";
import { prescriptionService } from "@/src/services/prescription.service";
import { newIdempotencyKey } from "@/src/utils/idempotencyKey";
import {
  buildCartOrderItems,
  buildOrderPayload,
  buildPrescriptionOrderItems,
  sumOrderDiscounts,
} from "@/src/utils/orderPayload";
import { CreateOrderRequest } from "@/src/types/order";
import { PRESCRIPTION_CATEGORY } from "@/src/constants/prescription-category";
import { useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import { Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { logger } from "@/src/utils/logger";

export function usePaymentCalculations() {
  const router = useNav();
  const insets = useSafeAreaInsets();
  const {
    toPay = "0",
    patientMemberId = "",
    prescriptionId = "",
    imageUrls = "",
    category = "",
    problem = "",
    symptoms = "",
    patientPhone = "",
  } = useLocalSearchParams<{
    toPay: string;
    patientMemberId?: string;
    prescriptionId?: string;
    // Deferred-creation flow: hosted image URLs + category to create the
    // prescription with, when no prescriptionId was passed.
    imageUrls?: string;
    category?: string;
    problem?: string;
    symptoms?: string;
    patientPhone?: string;
  }>();

  // Image URLs carried from the upload flow when the prescription record is
  // created here (at Place Order) rather than at Preview.
  const parsedImageUrls: string[] = (() => {
    try {
      return imageUrls ? JSON.parse(imageUrls) : [];
    } catch {
      return [];
    }
  })();
  const parsedCategory = category
    ? Number(category)
    : PRESCRIPTION_CATEGORY.PRESCRIPTION_ORDER;

  // Remembers a prescription created during this checkout so a retry after a
  // failed order does NOT create a duplicate prescription — we reuse the id.
  const createdRxIdRef = useRef<string>("");

  // One idempotency key per checkout attempt (this screen session). Retries
  // reuse it so the backend can dedupe; leaving the screen starts a fresh key.
  const idempotencyKeyRef = useRef<string>("");

  const prescriptionOrderItems = usePrescriptionOrderStore((s) => s.items);
  const clearPrescriptionOrder = usePrescriptionOrderStore((s) => s.clear);
  const isPrescriptionFlow = prescriptionOrderItems.length > 0;

  // Field selectors, or any checkout write re-runs the whole calculation.
  const bill = useCheckoutStore((s) => s.bill);
  const walletUsed = useCheckoutStore((s) => s.walletUsed);
  const coinsUsed = useCheckoutStore((s) => s.coinsUsed);
  const corporateCreditsUsed = useCheckoutStore((s) => s.corporateCreditsUsed);
  const couponCode = useCheckoutStore((s) => s.couponCode);
  const clearCheckout = useCheckoutStore((s) => s.clear);
  const removeCoupon = useCouponStore((s) => s.remove);

  const billBreakdown = {
    itemTotal: bill?.subtotal ?? 0,
    productDiscount: bill?.productDiscount ?? 0,
    couponDiscount: bill?.couponDiscount ?? 0,
    walletDiscount: bill?.walletDiscount ?? 0,
    coinsDiscount: bill?.coinsDiscount ?? 0,
    creditsDiscount: bill?.corporateCreditsDiscount ?? 0,
    deliveryFee: bill?.deliveryFee ?? 0,
    handlingCharge: bill?.handlingCharge ?? 0,
    totalSaved: bill?.totalSaved ?? 0,
    toPay: bill?.toPay ?? parseFloat(toPay),
  };

  const totalDiscount = sumOrderDiscounts(billBreakdown);

  const selectedMethod = useCheckoutDraftStore((s) => s.paymentMethod);
  const setSelectedMethod = useCheckoutDraftStore((s) => s.setPaymentMethod);
  const clearCheckoutDraft = useCheckoutDraftStore((s) => s.clearDraft);
  const [showLocationSheet, setShowLocationSheet] = useState(false);
  // Drives the Place Order button loader for the WHOLE operation — including
  // the deferred prescription upload that runs before createOrder — so the
  // button reacts instantly on press instead of after that first call.
  const [placingOrder, setPlacingOrder] = useState(false);
  const { start: startCheckoutTrace, stop: stopCheckoutTrace } =
    usePerformanceTrace({
      traceName: PERF_TRACES.CHECKOUT_FLOW,
      manualStart: true,
      maxDurationMs: 30_000,
    });

  // The address the user has selected — the same one the location sheet
  // highlights. Display and payload both read it, so what the screen shows is
  // what the order ships to.
  const { address: defaultAddress, displayLocation } = useDeliveryAddress();
  const { items: cartItems } = useCart();
  const { createOrder, loading: ordering } = useCreateOrder();

  const deliveryLabel = displayLocation?.label ?? defaultAddress?.label ?? null;
  const deliveryCity = displayLocation?.city ?? null;
  const hasAddress = !!deliveryCity && !!defaultAddress;

  const handlePlaceOrder = async () => {
    // The one flow that keeps the blocking modal: placing an order must be
    // acknowledged as not-happening, not just implied by the banner.
    if (!requireInternet({ critical: true })) return;
    if (!hasAddress || !defaultAddress) {
      setShowLocationSheet(true);
      return;
    }

    // The calculated bill is the only trusted total. Without it the route param is the
    // sole source, and that is spoofable and can be stale -- refuse rather than send it.
    if (!bill) {
      Alert.alert(
        "Order Total Unavailable",
        "We couldn't confirm your bill. Please go back to your cart and try again.",
      );
      return;
    }

    // Loader on immediately, before any network call.
    setPlacingOrder(true);

    // Generate the idempotency key once; a retry after failure reuses it so
    // the backend dedupes instead of creating a duplicate order.
    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current = newIdempotencyKey();
    }
    // Trace the real checkout latency (prescription upload + createOrder),
    // starting only once the order is actually in flight — not screen dwell.
    startCheckoutTrace({ method: selectedMethod });

    // Create the prescription now (deferred from Preview) when we're carrying
    // image URLs and don't already have an id. createdRxIdRef keeps this
    // idempotent: a retry after a failed order reuses the created prescription
    // instead of POSTing a duplicate.
    let effectivePrescriptionId = prescriptionId || createdRxIdRef.current;
    let orderItems: CreateOrderRequest["items"] = [];
    let payload: CreateOrderRequest | undefined;
    let traceStatus = "failed";
    try {
      if (!effectivePrescriptionId && parsedImageUrls.length > 0) {
        const rx = await prescriptionService.upload({
          imageUrls: parsedImageUrls,
          category: parsedCategory,
        });
        if (!rx.success) {
          traceStatus = "rx_upload_failed";
          Alert.alert(
            "Upload Failed",
            rx.error ?? "Could not save prescription. Please try again.",
          );
          return;
        }
        effectivePrescriptionId = rx.data?.id ?? "";
        createdRxIdRef.current = effectivePrescriptionId;
      }

      orderItems = isPrescriptionFlow
        ? buildPrescriptionOrderItems(prescriptionOrderItems)
        : buildCartOrderItems(cartItems);

      payload = buildOrderPayload({
        items: orderItems,
        address: defaultAddress,
        bill: billBreakdown,
        subtotal: bill?.subtotal,
        idempotencyKey: idempotencyKeyRef.current,
        couponCode,
        walletUsed,
        coinsUsed,
        creditsUsed: corporateCreditsUsed,
        prescriptionId: effectivePrescriptionId,
        patientMemberId,
        patientPhone,
        problem,
        symptoms,
      });

      const order = await createOrder(payload, idempotencyKeyRef.current);
      traceStatus = "success";
      if (order?.id) {
        void analyticsService.logPurchase(
          String(order.id),
          Number(billBreakdown.toPay),
          orderItems.length,
        );
      }
      removeCoupon();
      clearCheckout();
      clearPrescriptionOrder();
      clearCheckoutDraft();
      // Fire-and-forget: a notification failure must never block the success
      // screen. Logged in dev so a silent failure is still visible.
      if (order?.id) {
        orderNotification
          .showOrderPlaced({
            orderId: order.id,
            estimatedDelivery: order.estimatedDelivery,
            imageUrl: orderItems[0]?.medicineSnapshot?.image,
            itemCount: orderItems.length,
          })
          .catch((e) => {
            if (__DEV__) logger.debug("[OrderNotification] failed:", e);
          });
      }
      router.replace({
        pathname: "/(stack)/order-success",
        params: {
          orderId: order?.orderId ?? order?.id ?? "",
          total: String(Number(billBreakdown.toPay).toFixed(2)),
        },
      });
    } catch (e) {
      const err = asError(e);
      // Redacted on purpose: the payload carries the delivery address and patient phone.
      if (__DEV__) {
        logger.debug("[PlaceOrder] failed", {
          itemCount: payload?.items.length ?? 0,
          total: payload?.total,
          hasPrescription: !!payload?.prescriptionId,
        });
        logger.debug(
          "[PlaceOrder] error:",
          err?.data ?? err?.response?.data ?? err?.message,
        );
      }
      reportError(err, "placeOrder:cart");
      Alert.alert("Order Failed", orderErrorMessage(err));
    } finally {
      setPlacingOrder(false);
      stopCheckoutTrace(
        { status: traceStatus },
        { item_count: orderItems.length },
      );
    }
  };

  return {
    router,
    insets,
    toPay,
    patientMemberId,
    prescriptionId,
    billBreakdown,
    totalDiscount,
    selectedMethod,
    setSelectedMethod,
    showLocationSheet,
    setShowLocationSheet,
    deliveryLabel,
    deliveryCity,
    hasAddress,
    defaultAddress,
    ordering: placingOrder || ordering,
    handlePlaceOrder,
  };
}
