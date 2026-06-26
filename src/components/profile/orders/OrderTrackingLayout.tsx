import { orderApi } from "@/src/api/order.api";
import { BillDetailsSheet } from "@/src/components/cart/BillDetailsSheet";
import { AlreadyHaveItemsModal } from "@/src/components/prescription/AlreadyHaveItemsModal";
import { AlertDialog } from "@/src/components/ui/AlertDialog";
import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { useCart } from "@/src/hooks/queries/useCart";
import { useOrderById } from "@/src/hooks/queries/useOrderById";
import { useNav } from "@/src/hooks/useNav";
import { QUERY_KEYS } from "@/src/lib/react-query/queryKeys";
import { ORDER_STATUS, TrackingStep } from "@/src/types/order";
import { downloadLocalAsset } from "@/src/utils/fileDownload";
import { buildCartInputs } from "@/src/utils/reorderCart";
import { useQueryClient } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { CancelOrderDialog } from "./CancelOrderDialog";
import { DigitalPrescriptionModal } from "./DigitalPrescriptionModal";
import { orderStyles as s } from "./orders.styles";
import { OrderTrackingModal } from "./OrderTrackingModal";
import { OrderTrackingSkeleton } from "./OrderTrackingSkeleton";

const invoiceAsset = require("../../../../assets/pdf/Invoice.pdf");

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
    opacity.value = withDelay(d, withTiming(1, { duration: 260, easing: EASE_OUT }));
    translateY.value = withDelay(d, withTiming(0, { duration: 260, easing: EASE_OUT }));
  }, [triggered]);

  const rowStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const lineColor = step.completed && !step.isActive ? "#16A34A" : "#E5E7EB";
  const textColor = step.cancelled ? "#DC2626" : step.completed || step.isActive ? "#1A1C1E" : "#9CA3AF";

  const renderDot = () => {
    if (step.cancelled) {
      return (
        <View style={{ width: 18, height: 18, borderRadius: 12, backgroundColor: "#DC2626", alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "#FFF", fontSize: 9, fontWeight: "700", lineHeight: 11 }}>✕</Text>
        </View>
      );
    }
    if (step.isActive) {
      // Current stop — solid green with white ring: clearly marks "you are here"
      return (
        <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: "#16A34A", borderWidth: 3, borderColor: "#DCFCE7", alignItems: "center", justifyContent: "center" }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#fff" }} />
        </View>
      );
    }
    if (step.completed) {
      return (
        <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: "#16A34A", alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "#fff", fontSize: 9, fontWeight: "700", lineHeight: 11 }}>✓</Text>
        </View>
      );
    }
    // Pending — empty grey ring
    return (
      <View style={{ width: 16, height: 16, borderRadius: 8, borderWidth: 1.5, borderColor: "#D1D5DB", backgroundColor: "#fff" }} />
    );
  };

  return (
    <Animated.View style={[{ flexDirection: "row", paddingHorizontal: 16 }, rowStyle]}>
      <View style={{ width: 26, alignItems: "center", alignSelf: 'stretch' }}>
        <View style={{ height: 24, justifyContent: "center", alignItems: "center" }}>
          {renderDot()}
        </View>
        {!isLast && (
          <View style={{ width: 2, flex: 1, backgroundColor: lineColor }} />
        )}
      </View>
      <View style={{ flex: 1, paddingLeft: 10, paddingBottom: isLast ? 4 : 10 }}>
        <Text style={[s.labelSm, { color: textColor }]} className="font-inter-semibold">
          {step.title}
        </Text>
        {(step.completed || step.cancelled) && !!step.time && (
          <Text style={s.labelSm} className="font-inter text-brand-subtext mt-0.5">
            {step.time}
          </Text>
        )}
      </View>
    </Animated.View>
  );
}

function SectionCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <View
      className={`bg-white rounded-lg mx-base ${className}`}
      style={{ borderWidth: 1, borderColor: "#F0F1F3", elevation: 0 }}
    >
      {children}
    </View>
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

function formatDateTime(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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
  const [cancelDialogVisible, setCancelDialogVisible] = useState(false);
  const [alertState, setAlertState] = useState<{
    visible: boolean;
    icon: 'check-green' | 'delete' | 'package';
    title: string;
    onClose?: () => void;
  }>({
    visible: false,
    icon: 'check-green',
    title: '',
  });

  const { items: cartItems, addItem, updateItem, clearCart } = useCart();

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
      setTimeout(() => router.push("/(modal)/cart" as any), 100);
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

  const handleCancelOrder = async (reason: string) => {
    if (!orderId) return;

    setIsCancelling(true);
    try {
      await orderApi.cancelOrder(orderId, reason);
      setCancelDialogVisible(false);
      // The detail query has a 60s staleTime, so without this the cancelled
      // status wouldn't show until that cache naturally expired — invalidate
      // both this order and the orders list so they reflect it immediately.
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOMER.ORDERS.BY_ID(orderId) });
      queryClient.invalidateQueries({ queryKey: ['customer', 'orders', 'list'] });
      setAlertState({
        visible: true,
        icon: 'check-green',
        title: 'Order cancelled successfully!',
        onClose: () => {
          setTimeout(() => router.back(), 500);
        },
      });
    } catch (error) {
      if (__DEV__) console.error('[CancelOrder]', error);
      setCancelDialogVisible(false);
      setAlertState({
        visible: true,
        icon: 'delete',
        title: 'Failed to cancel order. Please try again.',
      });
    } finally {
      setIsCancelling(false);
    }
  };

  useEffect(() => {
    if (order && !animTriggered) setAnimTriggered(true);
  }, [order]);

  const statusInfo = (order?.status != null ? ORDER_STATUS[order.status] : undefined) ?? {
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

  const subtotal = Number(order?.subtotal ?? bill?.itemTotal ?? 0);
  const mrpTotal =
    subtotal > 0
      ? subtotal + productDiscount
      : toPay +
      Number(order?.discountAmount ?? 0) -
      deliveryFee -
      handlingCharge;

  const isCancelled = order?.status === 0;

  // Map toStatus → timestamp from statusLogs for accurate step times
  const logTimeByStatus: Record<string, string> = {};
  (order?.statusLogs ?? []).forEach((log) => {
    if (log.toStatus && log.createdAt) {
      logTimeByStatus[log.toStatus] = log.createdAt;
    }
  });
  const logTime = (status: number) => logTimeByStatus[String(status)] ?? null;

  const STATUS_TITLE: Record<number, string> = {
    1: "Order Placed",
    2: "Confirmed",
    3: "Verified by Pharmacist",
    4: "Processing",
    5: "Packed",
    6: "Shipped",
    7: "Delivered",
    8: "Under Review",
    9: "Processing",
    10: "Under Review",
    0: "Cancelled",
  };

  // For cancelled orders: build steps only from what statusLogs recorded
  const trackingSteps = isCancelled
    ? (order?.statusLogs ?? [])
      .slice()
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      )
      .map((log) => ({
        title: STATUS_TITLE[Number(log.toStatus)] ?? `Status ${log.toStatus}`,
        time: formatDateTime(log.createdAt),
        completed: Number(log.toStatus) !== 0,
        cancelled: Number(log.toStatus) === 0,
        isActive: false,
      }))
    : [
      {
        status: 1,
        title: "Order Placed",
        time: logTime(1) ?? order?.createdAt,
      },
      {
        status: 2,
        title: "Confirmed",
        time: logTime(2) ?? order?.confirmedAt,
      },
      {
        status: 3,
        title: "Verified",
        time: logTime(3) ?? order?.processingAt,
      },
      {
        status: 4,
        title: "Processing",
        time: logTime(4) ?? order?.processingAt,
      },
      { status: 5, title: "Packed", time: logTime(5) ?? order?.processingAt },
      { status: 6, title: "Shipped", time: logTime(6) ?? order?.shippedAt },
      {
        status: 7,
        title: "Delivered",
        time: logTime(7) ?? order?.deliveredAt ?? order?.estimatedDelivery,
      },
    ].map((s) => {
      // Only treat status as a progress position if it's a known step (1-7).
      // Unknown codes (e.g. 11 = pending payment) must not mark later steps complete.
      const STEP_STATUSES = [1, 2, 3, 4, 5, 6, 7];
      const cur = STEP_STATUSES.includes(order?.status ?? -1) ? (order?.status ?? 0) : 0;
      return {
        title: s.title,
        time: s.time ? formatDateTime(s.time) : "—",
        completed: cur > 0 && cur >= s.status,
        cancelled: false,
        isActive: cur > 0 ? cur === s.status : s.status === 1,
      };
    });

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
        title={order?.orderId ? `${String(order.orderId).replace(/[^a-zA-Z_]/g, '') + "-" + String(order.orderId).slice(-6).toUpperCase()}` : "Order Details"}
        showBorder
        rightSlot={
          <Touchable
            className="flex-row items-center gap-1"
            activeOpacity={0.7}
            onPress={() => downloadLocalAsset(invoiceAsset, "Invoice")}
          >
            <Text
              style={s.labelMd}
              className="font-inter-semibold text-brand-primary"
            >
              Get Invoice
            </Text>
            <icons.download width={20} height={20} fill="#0F7635" />
          </Touchable>
        }
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 12,
          paddingBottom: Math.max(adjustedBottom, 16) + 16,
          gap: 10,
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
                  logTime(7) ??
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
                  marginHorizontal: 10,
                  borderStyle: "dashed",
                  marginTop: 4,
                }}
              />
              <Touchable
                className="flex-row items-center justify-center py-3"
                activeOpacity={0.7}
                onPress={() => setTrackingModalVisible(true)}
              >
                <Text
                  style={s.labelSm}
                  className="font-inter-semibold text-brand-primary mr-1"
                >
                  View all updates
                </Text>
                <icons.arrow_down_green width={18} height={18} />
              </Touchable>
            </>
          )}
        </SectionCard>

        <SectionCard>
          <View className="flex-row items-center justify-between px-4 pt-4 pb-3">
            <Text style={s.labelMd} className="font-inter-bold text-brand-text">
              Items Ordered ({items.length})
            </Text>
            <View className="flex-row gap-2">
              {order?.status === 7 && (
                <Touchable
                  className="rounded-full px-3 py-1 flex-row items-center"
                  style={{
                    borderWidth: 1.33,
                    borderColor: "#FDE047",
                    backgroundColor: "#FEF9C3",
                  }}
                  activeOpacity={0.7}
                  onPress={() =>
                    router.push({
                      pathname: "/profile/orders/return",
                      params: { orderId },
                    } as any)
                  }
                >
                  <icons.package_icon width={14} height={14} fill="#854D0E" />
                  <Text
                    style={s.labelSm}
                    className="font-inter-semibold text-brand-text ml-1.5"
                  >
                    Return
                  </Text>
                </Touchable>
              )}
              {order?.status !== 7 && order?.status !== 0 && (
                <Touchable
                  className="rounded-full px-3 py-1 flex-row items-center"
                  style={{
                    borderWidth: 1.33,
                    borderColor: "#515F0014",
                    backgroundColor: "#FFFFDC",
                    shadowColor: "#000000",
                    shadowOffset: { width: 0, height: 5.33 },
                    shadowOpacity: 0.05,
                    shadowRadius: 32,
                  }}
                  activeOpacity={0.7}
                  onPress={() => setCancelDialogVisible(true)}
                  disabled={isCancelling || cancelDialogVisible}
                >
                  <Text
                    style={s.labelSm}
                    className="font-inter-semibold text-brand-text ml-1.5"
                  >
                    {isCancelling ? 'Cancelling...' : 'Cancel Order'}
                  </Text>
                </Touchable>
              )}
            </View>
          </View>
          {items.map((item, index, arr) => (
            <View key={item.id}>
              <Touchable
                activeOpacity={0.7}
                onPress={() => {
                  const productId =
                    item.medicineSnapshot?.productId ??
                    item.medicineSnapshot?.slug ??
                    item.medicineId;
                  if (productId)
                    router.push({
                      pathname: "/product/[id]",
                      params: { id: productId },
                    } as any);
                }}
                className="flex-row px-4 py-3"
              >
                <View className="w-18 h-18 rounded-md border border-[#919EAB33] bg-[#FAFAFA] items-center justify-center mr-3 overflow-hidden">
                  {item.medicineSnapshot?.image ? (
                    <Image
                      source={{ uri: item.medicineSnapshot.image }}
                      style={s.productImg50}
                      resizeMode="contain"
                    />
                  ) : (
                    <icons.placeholder width={50} height={50} />
                  )}
                </View>
                <View className="flex-1">
                  <View className="flex-row justify-between items-start">
                    <Text
                      style={s.labelSm}
                      className="font-inter-semibold text-brand-text flex-1 pr-2"
                      numberOfLines={2}
                    >
                      {item.medicineSnapshot?.name ?? item.medicineId}
                    </Text>
                    <View className="items-end">
                      <Text
                        style={s.labelSm}
                        className="font-inter-bold text-brand-text"
                      >
                        {item.unitPrice
                          ? `₹${parseFloat((Number(item.unitPrice) * item.quantity).toFixed(2))}`
                          : "—"}
                      </Text>
                      {item.medicineSnapshot?.mrp != null && (
                        <Text
                          style={s.statusBadge}
                          className="font-inter text-brand-subtext line-through mt-0.5"
                        >
                          ₹
                          {parseFloat(
                            (item.medicineSnapshot.mrp * item.quantity).toFixed(
                              2,
                            ),
                          )}
                        </Text>
                      )}
                    </View>
                  </View>
                  {(item.medicineSnapshot?.brand ||
                    item.medicineSnapshot?.pack) && (
                      <Text
                        style={s.labelSm}
                        className="font-inter-medium text-brand-subtext mt-0.5"
                      >
                        {[item.medicineSnapshot.brand, item.medicineSnapshot.pack]
                          .filter(Boolean)
                          .join(" • ")}
                      </Text>
                    )}
                  <View className="flex-row mt-2">
                    <View
                      style={{
                        borderWidth: 1,
                        borderColor: "#E2E8F0",
                        backgroundColor: "#F3F4F6",
                      }}
                      className="rounded-sm px-2.5 py-0.5"
                    >
                      <Text
                        style={s.statusBadge}
                        className="font-inter-semibold text-brand-text"
                      >
                        Qty: {item.quantity}
                      </Text>
                    </View>
                  </View>
                </View>
              </Touchable>
              {index < arr.length - 1 && (
                <View
                  style={{
                    borderTopWidth: 1,
                    borderColor: "#E5E7EB",
                    marginHorizontal: 20,
                    borderStyle: "dashed",
                  }}
                />
              )}
            </View>
          ))}
        </SectionCard>

        <SectionCard>
          <Touchable
            className="flex-row items-center justify-between px-4 py-4"
            activeOpacity={0.7}
            onPress={() => setBillSheetVisible(true)}
          >
            <View className="flex-row items-center gap-3">
              <View
                style={{ borderWidth: 1, borderColor: "#E2E8F0" }}
                className="w-10 h-10 rounded-sm bg-[#F8FAFC] items-center justify-center"
              >
                <icons.description width={20} height={20} fill="#64748B" />
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
            <View className="flex-row items-center gap-2">
              <Text
                style={s.labelLg}
                className="font-inter-bold text-brand-text"
              >
                {order?.total != null
                  ? `₹${Number(order.total).toFixed(2)}`
                  : "—"}
              </Text>
              <icons.arrow_forward_ios width={14} height={14} fill="#6A6A6A" />
            </View>
          </Touchable>
        </SectionCard>

        <View className="mx-base rounded-lg overflow-hidden border border-[#919EAB33] bg-white">
          <LinearGradient
            colors={["#FBFEFC", "#EBFAF0"]}
            start={{ x: 0.5, y: 1 }}
            end={{ x: 0.5, y: 0 }}
          >
            <View className="px-4 py-3 flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <icons.percent_discount width={18} height={18} fill="#0F7635" />
                <Text
                  style={s.labelMd}
                  className="font-inter-bold text-brand-text"
                >
                  Saving this order
                </Text>
              </View>
              <LinearGradient
                colors={["#68D36C", "#329939"]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={{ borderRadius: 6 }}
              >
                <View className="px-2.5 py-1">
                  <Text
                    style={s.labelSm}
                    className="font-inter-bold text-white"
                  >
                    ₹
                    {Number(
                      bill?.totalSaved ?? order?.discountAmount ?? 0,
                    ).toFixed(2)}
                  </Text>
                </View>
              </LinearGradient>
            </View>
          </LinearGradient>
          <View className="px-4 py-2">
            {productDiscount > 0 && (
              <View className="flex-row justify-between items-center py-2">
                <Text
                  style={s.labelSm}
                  className="font-inter-medium text-[#6A6A6A]"
                >
                  Product Discount
                </Text>
                <Text
                  style={s.labelSm}
                  className="font-inter-semibold text-[#0F7635]"
                >
                  -₹{productDiscount.toFixed(2)}
                </Text>
              </View>
            )}
            {couponDiscount > 0 && (
              <View className="flex-row justify-between items-center py-2">
                <Text
                  style={s.labelSm}
                  className="font-inter-medium text-[#6A6A6A]"
                >
                  Coupon Discount
                </Text>
                <Text
                  style={s.labelSm}
                  className="font-inter-semibold text-[#0F7635]"
                >
                  -₹{couponDiscount.toFixed(2)}
                </Text>
              </View>
            )}
            {walletDiscount > 0 && (
              <View className="flex-row justify-between items-center py-2">
                <Text
                  style={s.labelSm}
                  className="font-inter-medium text-[#6A6A6A]"
                >
                  CareSure Wallet
                </Text>
                <Text
                  style={s.labelSm}
                  className="font-inter-semibold text-[#0F7635]"
                >
                  -₹{walletDiscount.toFixed(2)}
                </Text>
              </View>
            )}
            {coinsDiscount > 0 && (
              <View className="flex-row justify-between items-center py-2">
                <Text
                  style={s.labelSm}
                  className="font-inter-medium text-[#6A6A6A]"
                >
                  CareSure Coins
                </Text>
                <Text
                  style={s.labelSm}
                  className="font-inter-semibold text-[#0F7635]"
                >
                  -₹{coinsDiscount.toFixed(2)}
                </Text>
              </View>
            )}
            {productDiscount === 0 &&
              couponDiscount === 0 &&
              walletDiscount === 0 &&
              coinsDiscount === 0 && (
                <View className="flex-row justify-between items-center py-2">
                  <Text
                    style={s.labelSm}
                    className="font-inter-medium text-[#6A6A6A]"
                  >
                    No discounts applied
                  </Text>
                  <Text
                    style={s.labelSm}
                    className="font-inter-semibold text-[#0F7635]"
                  >
                    ₹0.00
                  </Text>
                </View>
              )}
          </View>
        </View>

        <SectionCard className="px-4 py-4">
          <Text className="text-[14px] font-inter-semibold text-brand-text mb-3">
            Deliver To
          </Text>
          {order?.deliveryAddress ? (
            <View style={{ gap: 2 }}>
              <Text
                style={s.labelSm}
                className="font-inter-bold text-brand-text"
              >
                {order.deliveryAddress.name}
              </Text>
              <Text
                style={s.labelSm}
                className="font-inter text-brand-subtext leading-[18px] mt-1"
              >
                {[order.deliveryAddress.line1, order.deliveryAddress.line2]
                  .filter(Boolean)
                  .join(", ")}
                {", "}
                {order.deliveryAddress.city},{"\n"}
                {order.deliveryAddress.state.toUpperCase()},{" "}
                {order.deliveryAddress.pincode}
              </Text>
              <Text style={s.labelSm} className="font-inter text-brand-subtext">
                Phone : {order.deliveryAddress.phone}
              </Text>
            </View>
          ) : (
            <Text style={s.labelSm} className="font-inter text-brand-subtext">
              —
            </Text>
          )}
        </SectionCard>

        <SectionCard className="px-4 py-4">
          <Text className="text-[14px] font-inter-semibold text-brand-text mb-3">
            Payment Method
          </Text>
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 items-center justify-center bg-[#FFFFFF]">
              <icons.credit_card width={24} height={24} fill="#0F7635" />
            </View>
            <View>
              <Text
                style={s.labelMd}
                className="font-inter-semibold text-brand-text"
              >
                Paid online
              </Text>
              <Text
                style={s.labelSm}
                className="font-inter-medium text-brand-subtext"
              >
                UPI / Netbanking
              </Text>
            </View>
          </View>
        </SectionCard>

        {order?.clinicalData && (
          <SectionCard className="px-4 py-4 mb-2">
            <Text
              style={s.labelMd}
              className="font-inter-semibold text-[#0F1724] mb-3"
            >
              Prescription Details
            </Text>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <View
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderWidth: 1,
                    borderColor: "#919EAB33",
                  }}
                  className="w-10 h-10 rounded-sm items-center justify-center"
                >
                  <icons.prescription_green width={22} height={22} />
                </View>
                <View>
                  <Text
                    style={s.labelSm}
                    className="font-inter-bold text-[#0F1724]"
                  >
                    Prescription Attached
                  </Text>
                  <View className="flex-row items-center gap-1 mt-0.5">
                    <icons.verified_user_round width={14} height={14} />
                    <Text
                      style={s.labelSm}
                      className="font-inter-medium text-[#16A34A]"
                    >
                      Verified by our Pharmacist
                    </Text>
                  </View>
                </View>
              </View>
              <Touchable
                onPress={() => setRxModalVisible(true)}
                style={{
                  backgroundColor: "#FFFFFF",
                  borderWidth: 1,
                  borderColor: "#00000014",
                }}
                className="rounded-md px-4 py-1.5"
                activeOpacity={0.5}
              >
                <Text
                  style={s.labelSm}
                  className="font-inter-semibold text-[#0F1724]"
                >
                  View Rx
                </Text>
              </Touchable>
            </View>
          </SectionCard>
        )}
      </ScrollView>

      <View
        className="bg-white border-t border-[#919EAB33] px-4"
        style={{ paddingTop: 12, paddingBottom: Math.max(adjustedBottom, 16) }}
      >
        <Touchable
          className="bg-brand-primary rounded-lg py-[15px] items-center"
          activeOpacity={0.85}
          onPress={handleReOrder}
          disabled={isProceeding}
          style={{ opacity: isProceeding ? 0.75 : 1 }}
        >
          {isProceeding ? (
            <View className="flex-row items-center gap-2">
              <ActivityIndicator size="small" color="#fff" />
              <Text style={s.labelMd} className="font-inter-semibold text-white">
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

      {order?.clinicalData && (
        <DigitalPrescriptionModal
          visible={rxModalVisible}
          onClose={() => setRxModalVisible(false)}
          clinicalData={order.clinicalData}
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

      <CancelOrderDialog
        visible={cancelDialogVisible}
        onClose={() => setCancelDialogVisible(false)}
        onConfirm={handleCancelOrder}
        loading={isCancelling}
        orderNumber={
          order?.orderId
            ? String(order.orderId).replace(/[^a-zA-Z_]/g, "").slice(0, 2).toUpperCase() +
              String(order.orderId).slice(-5)
            : undefined
        }
        itemsCount={items.length}
        totalAmount={toPay}
      />

      <AlertDialog
        visible={alertState.visible}
        onClose={closeAlert}
        icon={alertState.icon}
        title={alertState.title}
        buttons={[
          {
            label: 'OK',
            onPress: closeAlert,
            variant: 'green',
          },
        ]}
      />
    </View>
  );
};
