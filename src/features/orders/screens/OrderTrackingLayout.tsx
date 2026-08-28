import { AlertDialog } from "@/src/components/ui/AlertDialog";
import { NoInternetState } from "@/src/components/ui/NoInternetState";
import { RetryState } from "@/src/components/ui/RetryState";
import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { BillDetailsSheet } from "@/src/features/cart/components/BillDetailsSheet";
import { useCart } from "@/src/features/cart/hooks/useCart";
import { AlreadyHaveItemsModal } from "@/src/features/orders/components/AlreadyHaveItemsModal";
import { useOrderById } from "@/src/features/orders/hooks/useOrderById";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { useLiveScreenState } from "@/src/hooks/ui/useLiveScreenState";
import { useNav } from "@/src/hooks/useNav";
import { exactScale } from "@/src/utils/exactScale";
import { formatOrderId } from "@/src/utils/order";
import { getCancellationReason, isOrderDelayed } from "@/src/utils/orderDelay";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { DigitalPrescriptionModal } from "../components/DigitalPrescriptionModal";
import { InvoiceModal } from "../components/InvoiceModal";
import { OrderTrackingModal } from "../components/OrderTrackingModal";
import { OrderTrackingSkeleton } from "../components/OrderTrackingSkeleton";
import {
  CANCELLED_STATUSES,
  ORDER_STATUS_CODE,
  TERMINAL_OR_CANCELLED_STATUSES,
} from "../constants/order-status";
import { useOrderTrackingSteps } from "../hooks/useOrderTrackingSteps";
import { useReturnEligibility } from "../hooks/useReturnEligibility";
import {
  DeliveryAddressSection,
  ItemsOrderedSection,
  PaymentMethodSection,
  PrescriptionSection,
  ReturnStatusSection,
  SavingsBreakdownSection,
  SectionCard,
  TrackingStatusBanner,
} from "../sections/tracking";
import { ORDER_STATUS, TrackingStep } from "../types";
import { buildCartInputs } from "../utils/reorderCart";
import { styles as s } from "./OrderTrackingLayout.styles";

const EASE_OUT = Easing.out(Easing.cubic);

function TrackingStepRow({
  step,
  index,
  isLast,
  triggered,
}: {
  step: TrackingStep;
  index: number;
  isLast: boolean;
  triggered: boolean;
}) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(10);

  useEffect(() => {
    if (!triggered) return;
    const d = index * 90;
    opacity.value = withDelay(
      d,
      withTiming(1, { duration: 260, easing: EASE_OUT }),
    );
    translateY.value = withDelay(
      d,
      withTiming(0, { duration: 260, easing: EASE_OUT }),
    );
  }, [index, triggered, opacity, translateY]);

  const rowStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const lineColor = step.completed && !step.isActive ? "#16A34A" : "#E5E7EB";
  const textColor = step.cancelled
    ? "#DC2626"
    : step.completed || step.isActive
      ? "#1A1C1E"
      : "#9CA3AF";

  const renderDot = () => {
    if (step.cancelled) {
      return (
        <View style={s.dotCancelled}>
          <Text style={s.dotCancelledText}>
            ✕
          </Text>
        </View>
      );
    }
    if (step.isActive) {
      return (
        <View style={s.dotActive}>
          <View style={s.dotActiveInner} />
        </View>
      );
    }
    if (step.completed) {
      return (
        <View style={s.dotCompleted}>
          <Text style={s.dotCompletedText}>
            ✓
          </Text>
        </View>
      );
    }
    return (
      <View style={s.dotPending} />
    );
  };

  return (
    <Animated.View style={[s.stepRow, rowStyle]}>
      <View style={s.stepLeftCol}>
        <View style={s.stepDotWrap}>
          {renderDot()}
        </View>
        {!isLast && (
          <View
            style={[
              s.stepLine,
              { backgroundColor: lineColor },
            ]}
          />
        )}
      </View>
      <View
        style={[
          s.stepContentCol,
          { paddingBottom: isLast ? exactScale(4) : exactScale(10) },
        ]}
      >
        <Text style={[s.stepTitle, { color: textColor }]}>
          {step.title}
        </Text>
        {(step.completed || step.cancelled) && !!step.time && (
          <Text style={s.stepTime}>
            {step.time}
          </Text>
        )}
      </View>
    </Animated.View>
  );
}

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export const OrderTrackLayout: React.FC = () => {
  const router = useNav();
  const adjustedBottom = useAdjustedBottomInset();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { order, loading, isFetching, error, refetch, isPlaceholderData } =
    useOrderById(orderId);
  const liveState = useLiveScreenState({
    error,
    hasData: !!order,
    loading,
  });
  const [trackingModalVisible, setTrackingModalVisible] = useState(false);
  const [rxModalVisible, setRxModalVisible] = useState(false);
  const [billSheetVisible, setBillSheetVisible] = useState(false);
  const [animTriggered, setAnimTriggered] = useState(false);
  const [orderSeenForAnim, setOrderSeenForAnim] = useState<
    typeof order | undefined
  >(undefined);
  const [isCartModalVisible, setIsCartModalVisible] = useState(false);
  const [isProceeding, setIsProceeding] = useState(false);
  const [invoiceModalVisible, setInvoiceModalVisible] = useState(false);

  const [alertState, setAlertState] = useState<{
    visible: boolean;
    icon: "check-green" | "delete" | "package";
    title: string;
    onClose?: () => void;
  }>({
    visible: false,
    icon: "check-green",
    title: "",
  });

  const { items: cartItems, addItem, updateItem, clearCart } = useCart();
  const cartNavTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (cartNavTimer.current) clearTimeout(cartNavTimer.current);
    },
    [],
  );

  const closeAlert = () => {
    const onClose = alertState.onClose;
    setAlertState((prev) => ({ ...prev, visible: false, onClose: undefined }));
    onClose?.();
  };

  const addItemsToCart = async (replace: boolean) => {
    if (!order?.items?.length || isPlaceholderData) return;
    setIsProceeding(true);
    try {
      if (replace) await clearCart();
      const inputs = await buildCartInputs(order.items);
      for (const input of inputs) {
        const existing = !replace
          ? cartItems.find((c) => c.medicineId === input.medicineId)
          : null;
        if (existing) {
          await updateItem(existing.id, {
            quantity: existing.quantity + input.quantity,
          });
        } else {
          await addItem(input);
        }
      }
      setIsCartModalVisible(false);
      cartNavTimer.current = setTimeout(() => {
        cartNavTimer.current = null;
        router.push("/(commerce)/cart");
        setIsProceeding(false);
      }, 100);
    } catch (err) {
      if (__DEV__) console.error("[ReOrder]", err);
      setIsProceeding(false);
    }
  };

  const handleReOrder = () => {
    if (cartItems.length > 0) {
      setIsCartModalVisible(true);
    } else {
      addItemsToCart(false);
    }
  };

  if (order !== orderSeenForAnim) {
    setOrderSeenForAnim(order);
    if (order && !animTriggered) setAnimTriggered(true);
  }

  const {
    statusInfo,
    items,
    toPay,
    deliveryFee,
    handlingCharge,
    productDiscount,
    couponDiscount,
    walletDiscount,
    coinsDiscount,
    totalSaved,
    subtotal,
    mrpTotal,
    isInvoiceAvailable,
    isDelayed,
    cancellationReason,
    showExpectedDelivery,
    deliveredLogTime,
    isCancellable,
  } = useMemo(() => {
    const statusInfo = (order?.status != null
      ? ORDER_STATUS[order.status]
      : undefined) ?? {
      label: "PENDING",
      bg: "#FFFBE8",
      text: "#92600A",
      border: "#FFE998",
    };
    const items = order?.items ?? [];
    const toPay = Number(order?.total ?? 0);
    const deliveryFee = Number(order?.deliveryCharge ?? 0);
    const handlingCharge = Number(order?.handlingCharge ?? 0);

    const bill = order?.metadata?.billBreakdown;
    const productDiscount = Number(bill?.productDiscount ?? 0);
    const couponDiscount = Number(bill?.couponDiscount ?? 0);
    const walletDiscount = Number(bill?.walletDiscount ?? 0);
    const coinsDiscount = Number(bill?.coinsDiscount ?? 0);
    const totalSaved = Number(bill?.totalSaved ?? order?.discountAmount ?? 0);

    const subtotal = Number(order?.subtotal ?? bill?.itemTotal ?? 0);
    const mrpTotal =
      subtotal > 0
        ? subtotal + productDiscount
        : toPay +
          Number(order?.discountAmount ?? 0) -
          deliveryFee -
          handlingCharge;

    const isInvoiceAvailable =
      order?.status != null &&
      (
        [
          ORDER_STATUS_CODE.PACKED,
          ORDER_STATUS_CODE.SHIPPED,
          ORDER_STATUS_CODE.DELIVERED,
        ] as number[]
      ).includes(order.status);

    const isDelayed = isOrderDelayed(order);
    const cancellationReason = getCancellationReason(order);
    const showExpectedDelivery =
      !!order?.estimatedDelivery &&
      order.status !== ORDER_STATUS_CODE.DELIVERED &&
      !CANCELLED_STATUSES.includes(order?.status ?? -1);

    const isCancellable =
      order?.status != null &&
      !TERMINAL_OR_CANCELLED_STATUSES.includes(order.status) &&
      order?.isCorporateGeneratedOrder !== true;

    const deliveredLogTime = (order?.statusLogs ?? []).reduce<string | null>(
      (acc, log) =>
        log.toStatus === "7" && log.createdAt ? log.createdAt : acc,
      null,
    );

    return {
      statusInfo,
      items,
      toPay,
      deliveryFee,
      handlingCharge,
      productDiscount,
      couponDiscount,
      walletDiscount,
      coinsDiscount,
      totalSaved,
      subtotal,
      mrpTotal,
      isInvoiceAvailable,
      isDelayed,
      cancellationReason,
      showExpectedDelivery,
      deliveredLogTime,
      isCancellable,
    };
  }, [order]);

  const trackingSteps = useOrderTrackingSteps(order);
  const {
    hasActiveReturnRequest,
    showRequestReturnButton,
    showWindowExpiredMessage,
    returnDeadlineLabel,
  } = useReturnEligibility(order);

  const [showReturnToast, setShowReturnToast] = useState(false);
  const toastOpacity = useSharedValue(0);
  const toastTranslate = useSharedValue(15);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    let fadeOutTimer: NodeJS.Timeout;
    let hideTimer: NodeJS.Timeout;

    if (hasActiveReturnRequest && !isPlaceholderData) {
      setShowReturnToast(true);
      toastOpacity.value = withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      });
      toastTranslate.value = withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      });

      fadeOutTimer = setTimeout(() => {
        toastOpacity.value = withTiming(0, {
          duration: 300,
          easing: Easing.in(Easing.ease),
        });
        toastTranslate.value = withTiming(15, {
          duration: 300,
          easing: Easing.in(Easing.ease),
        });

        hideTimer = setTimeout(() => {
          setShowReturnToast(false);
        }, 300);
      }, 4000);
    }

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(hideTimer);
    };
  }, [hasActiveReturnRequest, isPlaceholderData, toastOpacity, toastTranslate]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const animatedToastStyle = useAnimatedStyle(() => {
    return {
      opacity: toastOpacity.value,
      transform: [{ translateY: toastTranslate.value }],
    };
  });

  if (liveState) {
    return (
      <View style={s.root}>
        <ScreenHeader title="Order Details" showBorder />
        {liveState === "offline" ? (
          <NoInternetState
            onRetry={() => void refetch()}
            retrying={isFetching}
          />
        ) : (
          <RetryState
            title="Couldn't load this order"
            onRetry={() => void refetch()}
            retrying={isFetching}
          />
        )}
      </View>
    );
  }

  if (loading) {
    return (
      <View style={s.root}>
        <ScreenHeader title="Order Details" showBorder />
        <OrderTrackingSkeleton />
      </View>
    );
  }

  return (
    <View style={s.root}>
      <ScreenHeader
        title={
          order?.orderId || orderId
            ? formatOrderId(order?.orderId || orderId)
            : "Order Details"
        }
        showBorder
        rightSlot={
          isInvoiceAvailable && !isPlaceholderData ? (
            <Touchable
              style={s.getInvoiceBtn}
              activeOpacity={0.7}
              onPress={() => setInvoiceModalVisible(true)}
            >
              <Text style={s.getInvoiceText}>
                Get Invoice
              </Text>
              <icons.download
                width={exactScale(20)}
                height={exactScale(20)}
                fill="#0F7635"
              />
            </Touchable>
          ) : undefined
        }
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        overScrollMode="auto"
        contentContainerStyle={[
          s.scrollContent,
          {
            paddingBottom:
              Math.max(adjustedBottom, exactScale(16)) + exactScale(16),
          },
        ]}
      >
        <View style={s.headerStatusWrap}>
          <Text style={s.headerStatusLabel}>
            {order?.status === 7 ? "Order Delivered on" : "Order placed on"}
          </Text>
          <View style={s.headerStatusDateRow}>
            <Text style={s.headerStatusDateText}>
              {order?.status === 7
                ? formatDate(
                    deliveredLogTime ??
                      order?.deliveredAt ??
                      order?.estimatedDelivery,
                  )
                : formatDate(order?.createdAt)}
            </Text>
            <View
              style={[
                s.headerStatusBadge,
                {
                  borderColor: statusInfo?.border ?? "#E5E7EB",
                  backgroundColor: statusInfo?.bg ?? "#F3F4F6",
                },
              ]}
            >
              <Text
                style={[
                  s.headerStatusBadgeText,
                  { color: statusInfo?.text ?? "#6B7280" },
                ]}
              >
                {statusInfo?.label ?? "—"}
              </Text>
            </View>
          </View>
          {showExpectedDelivery && (
            <Text style={s.expectedDeliveryText}>
              Expected delivery: {formatDate(order?.estimatedDelivery)}
            </Text>
          )}
        </View>

        <TrackingStatusBanner
          delayed={isDelayed}
          cancellationReason={cancellationReason}
        />

        <SectionCard style={s.trackingSectionCard}>
          <Text style={s.trackingSectionTitle}>
            Order Tracking
          </Text>
          {trackingSteps.slice(0, 3).map((step, index, arr) => (
            <TrackingStepRow
              key={index}
              step={step}
              index={index}
              isLast={index === arr.length - 1 && trackingSteps.length <= 3}
              triggered={animTriggered}
            />
          ))}
          {trackingSteps.length > 3 && (
            <>
              <View style={s.trackingDivider} />
              <Touchable
                style={s.viewAllUpdatesBtn}
                activeOpacity={0.7}
                onPress={() => setTrackingModalVisible(true)}
              >
                <Text style={s.viewAllUpdatesText}>
                  View all updates
                </Text>
                <icons.arrow_down_green
                  width={exactScale(18)}
                  height={exactScale(18)}
                />
              </Touchable>
            </>
          )}
        </SectionCard>

        <ReturnStatusSection
          returns={order?.returns}
          showWindowExpiredMessage={showWindowExpiredMessage}
        />

        <ItemsOrderedSection
          items={items}
          orderId={orderId}
          priceEstimateRatio={mrpTotal > 0 ? subtotal / mrpTotal : 1}
          actionsDisabled={isPlaceholderData}
          showReturnButton={showRequestReturnButton}
          returnDeadlineLabel={returnDeadlineLabel}
          hasActiveReturnRequest={hasActiveReturnRequest}
          isCancellable={isCancellable}
        />

        <SectionCard>
          <Touchable
            style={s.billCardRow}
            activeOpacity={0.7}
            onPress={() => setBillSheetVisible(true)}
          >
            <View style={s.billLeftCol}>
              <View style={s.billIconBox}>
                <icons.description
                  width={exactScale(20)}
                  height={exactScale(20)}
                  fill="#64748B"
                />
              </View>
              <View>
                <Text style={s.billTitle}>
                  Total Bill
                </Text>
                <Text style={s.billSubtitle}>
                  Incl.charges
                </Text>
              </View>
            </View>
            <View style={s.billRightCol}>
              <Text style={s.billTotalText}>
                {order?.total != null
                  ? `₹${Number(order.total).toFixed(2)}`
                  : "—"}
              </Text>
              <icons.arrow_forward_ios
                width={exactScale(14)}
                height={exactScale(14)}
                fill="#6A6A6A"
              />
            </View>
          </Touchable>
        </SectionCard>

        <SavingsBreakdownSection
          totalSaved={totalSaved}
          productDiscount={productDiscount}
          couponDiscount={couponDiscount}
          walletDiscount={walletDiscount}
          coinsDiscount={coinsDiscount}
        />

        <DeliveryAddressSection address={order?.deliveryAddress} />

        {/* Corporate-billed orders have no customer payment method to show. */}
        {order?.isCorporateGeneratedOrder !== true && (
          <PaymentMethodSection order={order} />
        )}

        {order?.clinicalData && order?.status === 7 && (
          <PrescriptionSection onViewRx={() => setRxModalVisible(true)} />
        )}
      </ScrollView>

      {showReturnToast && (
        <Animated.View
          style={[
            s.returnToast,
            {
              bottom: adjustedBottom + exactScale(78) + exactScale(12),
            },
            animatedToastStyle,
          ]}
        >
          <icons.check_circle
            width={exactScale(14)}
            height={exactScale(14)}
            fill="#0F7635"
          />
          <Text style={s.returnToastText}>
            Return Status
          </Text>
        </Animated.View>
      )}

      <View
        style={[
          s.reorderBar,
          { paddingBottom: adjustedBottom + exactScale(16) },
        ]}
      >
        <Touchable
          style={[
            s.reorderBtn,
            { opacity: isProceeding || isPlaceholderData ? 0.75 : 1 },
          ]}
          activeOpacity={0.85}
          onPress={handleReOrder}
          disabled={isProceeding || isPlaceholderData}
        >
          {isProceeding ? (
            <View style={s.reorderBtnAddingRow}>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={s.reorderBtnText}>
                Adding to cart...
              </Text>
            </View>
          ) : (
            <Text style={s.reorderBtnText}>
              Re Order
            </Text>
          )}
        </Touchable>
      </View>

      <OrderTrackingModal
        visible={trackingModalVisible}
        onClose={() => setTrackingModalVisible(false)}
        steps={trackingSteps}
      />

      <InvoiceModal
        visible={invoiceModalVisible}
        onClose={() => setInvoiceModalVisible(false)}
        order={order}
      />

      {order?.clinicalData && order?.status === 7 && (
        <DigitalPrescriptionModal
          visible={rxModalVisible}
          onClose={() => setRxModalVisible(false)}
          clinicalData={order.clinicalData}
          orderId={order.orderId}
        />
      )}

      <BillDetailsSheet
        isVisible={billSheetVisible}
        onClose={() => setBillSheetVisible(false)}
        linesCount={items.length}
        mrpTotal={mrpTotal}
        productSavings={productDiscount}
        couponDiscount={couponDiscount}
        walletDiscount={walletDiscount}
        coinsDiscount={coinsDiscount}
        deliveryFee={deliveryFee}
        handlingCharge={handlingCharge}
        toPay={toPay}
      />

      <AlreadyHaveItemsModal
        visible={isCartModalVisible}
        onClose={() => setIsCartModalVisible(false)}
        onAdd={() => addItemsToCart(false)}
        onReplace={() => addItemsToCart(true)}
        isProceeding={isProceeding}
      />

      <AlertDialog
        visible={alertState.visible}
        onClose={closeAlert}
        icon={alertState.icon}
        title={alertState.title}
        buttons={[
          {
            label: "OK",
            onPress: closeAlert,
            variant: "green",
          },
        ]}
      />
    </View>
  );
};
