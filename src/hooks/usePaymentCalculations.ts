import { useAddress } from "@/src/hooks/queries/useAddress";
import { useCart } from "@/src/hooks/queries/useCart";
import { useCreateOrder } from "@/src/hooks/mutations/useCreateOrder";
import { orderNotification } from "@/src/services/notifications/orderNotification";
import { useLocationStore } from "@/src/store/locationStore";
import { useCheckoutStore } from "@/src/store/checkoutStore";
import { useCouponStore } from "@/src/store/couponStore";
import { usePrescriptionOrderStore } from "@/src/store/prescriptionOrderStore";
import { useNetworkStore } from "@/src/store/useNetworkStore";
import { useNav } from "@/src/hooks/useNav";
import { prescriptionService } from "@/src/services/prescription.service";
import { PRESCRIPTION_CATEGORY } from "@/src/constants/prescription-category";
import { useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import { Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

  const prescriptionOrderItems = usePrescriptionOrderStore((s) => s.items);
  const clearPrescriptionOrder = usePrescriptionOrderStore((s) => s.clear);
  const isPrescriptionFlow = prescriptionOrderItems.length > 0;

  const {
    bill,
    walletUsed,
    coinsUsed,
    corporateCreditsUsed,
    couponCode,
    clear: clearCheckout,
  } = useCheckoutStore();
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

  const totalDiscount =
    billBreakdown.productDiscount +
    billBreakdown.couponDiscount +
    billBreakdown.walletDiscount +
    billBreakdown.coinsDiscount +
    billBreakdown.creditsDiscount;

  const [selectedMethod, setSelectedMethod] = useState("COD");
  const [showLocationSheet, setShowLocationSheet] = useState(false);
  // Drives the Place Order button loader for the WHOLE operation — including
  // the deferred prescription upload that runs before createOrder — so the
  // button reacts instantly on press instead of after that first call.
  const [placingOrder, setPlacingOrder] = useState(false);

  const { addresses } = useAddress();
  const storeLocation = useLocationStore((s) => s.location);
  const defaultAddress =
    addresses.find((a) => a.isDefault) ?? addresses[0] ?? null;
  const { items: cartItems } = useCart();
  const { createOrder, loading: ordering } = useCreateOrder();

  const deliveryLabel = storeLocation?.label ?? defaultAddress?.label ?? null;
  const deliveryCity =
    storeLocation?.city ??
    (defaultAddress
      ? [defaultAddress.line1, defaultAddress.line2, defaultAddress.city]
          .filter(Boolean)
          .join(", ")
      : null);
  const hasAddress = !!deliveryCity && !!defaultAddress;

  const handlePlaceOrder = async () => {
    const { isConnected } = useNetworkStore.getState();
    if (isConnected === false) {
      useNetworkStore.getState().showOfflineAlert();
      return;
    }
    if (!hasAddress || !defaultAddress) {
      setShowLocationSheet(true);
      return;
    }

    // Loader on immediately, before any network call.
    setPlacingOrder(true);

    // Create the prescription now (deferred from Preview) when we're carrying
    // image URLs and don't already have an id. createdRxIdRef keeps this
    // idempotent: a retry after a failed order reuses the created prescription
    // instead of POSTing a duplicate.
    let effectivePrescriptionId = prescriptionId || createdRxIdRef.current;
    if (!effectivePrescriptionId && parsedImageUrls.length > 0) {
      const rx = await prescriptionService.upload({
        imageUrls: parsedImageUrls,
        category: parsedCategory,
      });
      if (!rx.success) {
        setPlacingOrder(false);
        Alert.alert(
          "Upload Failed",
          rx.error ?? "Could not save prescription. Please try again.",
        );
        return;
      }
      effectivePrescriptionId = rx.data?.id ?? "";
      createdRxIdRef.current = effectivePrescriptionId;
    }

    const orderItems = isPrescriptionFlow
      ? prescriptionOrderItems.map((i) => ({
          medicineId: i.medicineId,
          quantity: i.quantity,
          unitPrice: String(i.unitPrice),
          medicineSnapshot: {
            name: i.medicineName,
            slug: i.medicineSlug,
            productId: i.productId ?? undefined,
            image: i.image ?? undefined,
            mrp: i.mrp,
            requiresPrescription: true,
          },
        }))
      : cartItems.map((i) => ({
          medicineId: i.medicineId,
          quantity: i.quantity,
          unitPrice: String(i.unitPrice),
          medicineSnapshot: {
            name: i.medicineName,
            slug: i.medicineSlug,
            productId: i.productId ?? i.metadata?.productId ?? undefined,
            image: i.image ?? i.metadata?.image ?? undefined,
            brand: i.metadata?.brand ?? undefined,
            pack: i.metadata?.pack ?? undefined,
            mrp: i.metadata?.mrp ?? undefined,
            requiresPrescription: i.requiresPrescription,
          },
        }));

    const payload = {
      items: orderItems,
      deliveryAddress: {
        name: defaultAddress.name,
        phone: defaultAddress.phone,
        line1: defaultAddress.line1,
        line2: defaultAddress.line2,
        city: defaultAddress.city,
        state: defaultAddress.state,
        pincode: defaultAddress.pincode,
        country: defaultAddress.country ?? "IN",
      },
      subtotal: String(
        Number(
          bill?.subtotal ??
            (isPrescriptionFlow
              ? prescriptionOrderItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0)
              : cartItems.reduce((s, i) => s + parseFloat(String(i.unitPrice)) * i.quantity, 0)),
        ).toFixed(2),
      ),
      deliveryCharge: String(billBreakdown.deliveryFee),
      taxAmount: "0",
      discountAmount: String(totalDiscount.toFixed(2)),
      total: toPay,
      deliveryType: "HOME_DELIVERY" as const,
      patientMemberIds: patientMemberId ? [patientMemberId] : undefined,
      prescriptionId: effectivePrescriptionId || undefined,
      isPurchased: effectivePrescriptionId ? true : undefined,
      problem: problem || undefined,
      symptoms: symptoms || undefined,
      metadata: {
        billBreakdown,
        preferences: {
          walletUsed: walletUsed,
          coinsUsed: coinsUsed,
          creditsUsed: corporateCreditsUsed,
          livePriceSyncUsed: false,
        },
        couponCode: couponCode ?? "",
        patientDetails: {
          phone: patientPhone || undefined,
          problem: problem || undefined,
          skipPrescription: !effectivePrescriptionId,
          symptoms: symptoms || undefined,
        },
      },
    };

    if (__DEV__) {
      console.log("[handlePlaceOrder] payload:", JSON.stringify(payload, null, 2));
    }

    try {
      const order: any = await createOrder(payload);
      removeCoupon();
      clearCheckout();
      clearPrescriptionOrder();
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
            if (__DEV__) console.log("[OrderNotification] failed:", e);
          });
      }
      router.replace({
        pathname: "/(stack)/order-success",
        params: { orderId: order?.id ?? "", total: toPay },
      });
    } catch (err: any) {
      if (__DEV__) {
        console.log("[PlaceOrder] payload:", JSON.stringify(payload, null, 2));
        console.log("[PlaceOrder] error:", JSON.stringify(err?.data ?? err?.response?.data ?? err, null, 2));
      }
      const errorMessage =
        err?.response?.data?.message ??
        err?.data?.message ??
        err?.message ??
        "Failed to place order. Please try again.";

      Alert.alert("Order Failed", errorMessage);
    } finally {
      setPlacingOrder(false);
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
