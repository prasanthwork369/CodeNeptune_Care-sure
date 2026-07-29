import { BillDetailsSheet } from "@/src/components/cart/BillDetailsSheet";
import { AlreadyHaveItemsModal } from "@/src/components/prescription/AlreadyHaveItemsModal";
import { AlertDialog } from "@/src/components/ui/AlertDialog";
import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { useCart } from "@/src/hooks/queries/useCart";
import { useOrderById } from "@/src/hooks/queries/useOrderById";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { useNav } from "@/src/hooks/useNav";
import { useOrderTrackingSteps } from "@/src/hooks/useOrderTrackingSteps";
import { ORDER_STATUS, TrackingStep } from "@/src/types/order";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { buildCartInputs } from "@/src/utils/reorderCart";
import { formatOrderId } from "@/src/utils/order";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { DigitalPrescriptionModal } from "./DigitalPrescriptionModal";
import { InvoiceModal } from "./InvoiceModal";
import { orderStyles as s } from "./orders.styles";
import { OrderTrackingModal } from "./OrderTrackingModal";
import { OrderTrackingSkeleton } from "./OrderTrackingSkeleton";
import {
  DeliveryAddressSection,
  ItemsOrderedSection,
  PaymentMethodSection,
  PrescriptionSection,
  SavingsBreakdownSection,
  SectionCard,
} from "./tracking-sections";

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
  }, [triggered]);

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
        <View
          style={{
            width: exactScale(18),
            height: exactScale(18),
            borderRadius: exactScale(9),
            backgroundColor: "#DC2626",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: "#FFF",
              fontSize: moderateScale(9),
              fontWeight: "700",
              lineHeight: moderateScale(11),
            }}
          >
            ✕
          </Text>
        </View>
      );
    }
    if (step.isActive) {
      // Current stop — solid green with white ring: clearly marks "you are here"
      return (
        <View
          style={{
            width: exactScale(22),
            height: exactScale(22),
            borderRadius: exactScale(11),
            backgroundColor: "#16A34A",
            borderWidth: exactScale(3),
            borderColor: "#DCFCE7",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              width: exactScale(8),
              height: exactScale(8),
              borderRadius: exactScale(4),
              backgroundColor: "#fff",
            }}
          />
        </View>
      );
    }
    if (step.completed) {
      return (
        <View
          style={{
            width: exactScale(18),
            height: exactScale(18),
            borderRadius: exactScale(9),
            backgroundColor: "#16A34A",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: moderateScale(9),
              fontWeight: "700",
              lineHeight: moderateScale(11),
            }}
          >
            ✓
          </Text>
        </View>
      );
    }
    // Pending — empty grey ring
    return (
      <View
        style={{
          width: exactScale(16),
          height: exactScale(16),
          borderRadius: exactScale(8),
          borderWidth: exactScale(1.5),
          borderColor: "#D1D5DB",
          backgroundColor: "#fff",
        }}
      />
    );
  };

  return (
    <Animated.View
      style={[
        { flexDirection: "row", paddingHorizontal: exactScale(16) },
        rowStyle,
      ]}
    >
      <View
        style={{
          width: exactScale(26),
          alignItems: "center",
          alignSelf: "stretch",
        }}
      >
        <View
          style={{
            height: exactScale(24),
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {renderDot()}
        </View>
        {!isLast && (
          <View
            style={{
              width: exactScale(2),
              flex: 1,
              backgroundColor: lineColor,
            }}
          />
        )}
      </View>
      <View
        style={{
          flex: 1,
          paddingLeft: exactScale(10),
          paddingBottom: isLast ? exactScale(4) : exactScale(10),
        }}
      >
        <Text
          style={[s.labelSm, { color: textColor }]}
          className="font-inter-semibold"
        >
          {step.title}
        </Text>
        {(step.completed || step.cancelled) && !!step.time && (
          <Text
            style={s.labelSm}
            className="font-inter text-brand-subtext mt-0.5"
          >
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
  const queryClient = useQueryClient();
  const adjustedBottom = useAdjustedBottomInset();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { order, loading } = useOrderById(orderId);
  const [trackingModalVisible, setTrackingModalVisible] = useState(false);
  const [rxModalVisible, setRxModalVisible] = useState(false);
  const [billSheetVisible, setBillSheetVisible] = useState(false);
  const [animTriggered, setAnimTriggered] = useState(false);
  const [isCartModalVisible, setIsCartModalVisible] = useState(false);
  const [isProceeding, setIsProceeding] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
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
    if (!order?.items?.length) return;
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
      setIsProceeding(false);
      cartNavTimer.current = setTimeout(() => {
        cartNavTimer.current = null;
        router.push("/(stack)/cart");
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

  useEffect(() => {
    if (order && !animTriggered) setAnimTriggered(true);
  }, [order]);

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
    order?.status != null && order.status >= 5 && order.status <= 7;

  const trackingSteps = useOrderTrackingSteps(order);

  // Same "toStatus → timestamp" lookup the tracking steps use, needed here to
  // show the precise "Delivered on" date in the header above.
  const deliveredLogTime = (order?.statusLogs ?? []).reduce<string | null>(
    (acc, log) => (log.toStatus === "7" && log.createdAt ? log.createdAt : acc),
    null,
  );

  if (loading) {
    return (
      <View className="flex-1 bg-[#F5F6FB]">
        <ScreenHeader title="Order Details" showBorder />
        <OrderTrackingSkeleton />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F5F6FB]">
      <ScreenHeader
        title={
          order?.orderId || orderId
            ? formatOrderId(order?.orderId || orderId)
            : "Order Details"
        }
        showBorder
        rightSlot={
          isInvoiceAvailable ? (
            <Touchable
              className="flex-row items-center"
              style={{ gap: exactScale(4) }}
              activeOpacity={0.7}
              onPress={() => setInvoiceModalVisible(true)}
            >
              <Text
                style={s.labelMd}
                className="font-inter-semibold text-brand-primary"
              >
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
        contentContainerStyle={{
          paddingTop: exactScale(12),
          paddingBottom:
            Math.max(adjustedBottom, exactScale(16)) + exactScale(16),
          gap: exactScale(10),
        }}
      >
        <View className="px-4 py-3 mx-base">
          <Text
            style={s.labelSm}
            className="font-inter-medium text-brand-text tracking-[0.5px]"
          >
            {order?.status === 7 ? "Order Delivered on" : "Order placed on"}
          </Text>
          <View className="flex-row items-center justify-start mt-1">
            <Text style={s.label20} className="font-inter-bold text-brand-text">
              {order?.status === 7
                ? formatDate(
                    deliveredLogTime ??
                      order?.deliveredAt ??
                      order?.estimatedDelivery,
                  )
                : formatDate(order?.createdAt)}
            </Text>
            <View
              style={{
                borderWidth: 1,
                borderRadius: 6,
                borderColor: statusInfo?.border ?? "#E5E7EB",
                backgroundColor: statusInfo?.bg ?? "#F3F4F6",
              }}
              className="px-2 py-1.5 ml-3"
            >
              <Text
                style={[
                  s.statusBadge,
                  { color: statusInfo?.text ?? "#6B7280" },
                ]}
                className="font-inter-bold tracking-[0.5px] uppercase"
              >
                {statusInfo?.label ?? "—"}
              </Text>
            </View>
          </View>
        </View>

        <SectionCard className="pt-4 pb-2">
          <Text
            style={s.labelMd}
            className="font-inter-bold text-brand-text mb-4 px-4"
          >
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
              <View
                style={{
                  borderTopWidth: 1,
                  borderColor: "#E5E7EB",
                  marginHorizontal: exactScale(10),
                  borderStyle: "dashed",
                  marginTop: exactScale(4),
                }}
              />
              <Touchable
                className="flex-row items-center justify-center"
                style={{ paddingVertical: exactScale(12) }}
                activeOpacity={0.7}
                onPress={() => setTrackingModalVisible(true)}
              >
                <Text
                  style={[s.labelSm, { marginRight: exactScale(4) }]}
                  className="font-inter-semibold text-brand-primary"
                >
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

        <ItemsOrderedSection
          items={items}
          orderId={orderId}
          orderStatus={order?.status}
          isCancelling={isCancelling}
          priceEstimateRatio={mrpTotal > 0 ? subtotal / mrpTotal : 1}
        />

        <SectionCard>
          <Touchable
            className="flex-row items-center justify-between"
            style={{
              paddingHorizontal: exactScale(16),
              paddingVertical: exactScale(16),
            }}
            activeOpacity={0.7}
            onPress={() => setBillSheetVisible(true)}
          >
            <View
              className="flex-row items-center"
              style={{ gap: exactScale(12) }}
            >
              <View
                style={{
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                  width: exactScale(40),
                  height: exactScale(40),
                  borderRadius: exactScale(4),
                }}
                className="bg-[#F8FAFC] items-center justify-center"
              >
                <icons.description
                  width={exactScale(20)}
                  height={exactScale(20)}
                  fill="#64748B"
                />
              </View>
              <View>
                <Text
                  style={s.labelMd}
                  className="font-inter-bold text-brand-text"
                >
                  Total Bill
                </Text>
                <Text
                  style={s.statusBadge}
                  className="font-inter-medium text-brand-subtext"
                >
                  Incl.charges
                </Text>
              </View>
            </View>
            <View
              className="flex-row items-center"
              style={{ gap: exactScale(8) }}
            >
              <Text
                style={s.labelLg}
                className="font-inter-bold text-brand-text"
              >
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

        <PaymentMethodSection />

        {order?.clinicalData && order?.status === 7 && (
          <PrescriptionSection onViewRx={() => setRxModalVisible(true)} />
        )}
      </ScrollView>

      <View
        className="bg-white border-t border-[#919EAB33]"
        style={{
          paddingHorizontal: exactScale(16),
          paddingTop: exactScale(12),
          paddingBottom: adjustedBottom + exactScale(16),
        }}
      >
        <Touchable
          className="items-center"
          activeOpacity={0.85}
          onPress={handleReOrder}
          disabled={isProceeding}
          style={{
            backgroundColor: "#0F7635",
            borderRadius: exactScale(8),
            paddingVertical: exactScale(15),
            opacity: isProceeding ? 0.75 : 1,
          }}
        >
          {isProceeding ? (
            <View
              className="flex-row items-center"
              style={{ gap: exactScale(8) }}
            >
              <ActivityIndicator size="small" color="#fff" />
              <Text
                style={s.labelMd}
                className="font-inter-semibold text-white"
              >
                Adding to cart...
              </Text>
            </View>
          ) : (
            <Text style={s.labelMd} className="font-inter-semibold text-white">
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
