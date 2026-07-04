import { orderApi } from "@/src/api/order.api";
import { AlertDialog } from "@/src/components/ui/AlertDialog";
import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { useCancellationReasons } from "@/src/hooks/queries/useCancellationReasons";
import { useOrderById } from "@/src/hooks/queries/useOrderById";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { useNav } from "@/src/hooks/useNav";
import { QUERY_KEYS } from "@/src/lib/react-query/queryKeys";
import { moderateScale, scale, verticalScale } from "@/src/utils/exactScale";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

interface ReasonConfig {
  icon: any;
  bgColor: string;
  iconColor: string;
  defaultDescription: string;
}

const REASON_CONFIGS: Record<string, ReasonConfig> = {
  "order by mistake": {
    icon: icons.cancel_mistake,
    bgColor: "#EAF7EE",
    iconColor: "#0F7635",
    defaultDescription: "I placed this order by mistake",
  },
  "found better price elsewhere": {
    icon: icons.cancel_better_price,
    bgColor: "#EEF4FF",
    iconColor: "#3B82F6",
    defaultDescription: "I found a better price",
  },
  "delivery time is too long": {
    icon: icons.cancel_delivery_long,
    bgColor: "#FFF3E6",
    iconColor: "#F97316",
    defaultDescription: "Delivery is longer than expected",
  },
  "no longer needed": {
    icon: icons.cancel_no_longer_needed,
    bgColor: "#F5F3FF",
    iconColor: "#8B5CF6",
    defaultDescription: "I no longer need these medicines",
  },
  "item(s) not required": {
    icon: icons.cancel_item_not_required,
    bgColor: "#FEF9C3",
    iconColor: "#CA8A04",
    defaultDescription: "I want to remove some or all item",
  },
  "item not required": {
    icon: icons.cancel_item_not_required,
    bgColor: "#FEF9C3",
    iconColor: "#CA8A04",
    defaultDescription: "I want to remove some or all item",
  },
  "other reason": {
    icon: icons.cancel_other_reason,
    bgColor: "#F3F4F6",
    iconColor: "#4B5563",
    defaultDescription: "Something else",
  },
  other: {
    icon: icons.cancel_other_reason,
    bgColor: "#F3F4F6",
    iconColor: "#4B5563",
    defaultDescription: "Something else",
  },
  "customer request": {
    icon: icons.cancel_mistake,
    bgColor: "#EAF7EE",
    iconColor: "#0F7635",
    defaultDescription: "Customer no longer wants the order",
  },
  "wrong address": {
    icon: icons.location_pin,
    bgColor: "#EEF4FF",
    iconColor: "#3B82F6",
    defaultDescription: "Delivery address is incorrect or unreachable",
  },
  "duplicate order": {
    icon: icons.cancel_item_not_required,
    bgColor: "#FFF3E6",
    iconColor: "#F97316",
    defaultDescription: "Customer placed the same order twice",
  },
};

function getReasonConfig(label: string) {
  const normalized = label.toLowerCase().trim();
  for (const key of Object.keys(REASON_CONFIGS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return REASON_CONFIGS[key];
    }
  }
  return {
    icon: icons.cancel_other_reason,
    bgColor: "#F3F4F6",
    iconColor: "#4B5563",
    defaultDescription: "Something else",
  };
}

const OTHER_OPTION = "__other__";

export function CancelOrderLayout() {
  const router = useNav();
  const queryClient = useQueryClient();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const bottomInset = useAdjustedBottomInset();

  const { order, loading: orderLoading } = useOrderById(orderId);
  const { data: reasons = [], isLoading: reasonsLoading } =
    useCancellationReasons();

  const [selectedReasonId, setSelectedReasonId] = useState<
    number | typeof OTHER_OPTION | null
  >(null);
  const [otherReason, setOtherReason] = useState("");
  const [error, setError] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [alertState, setAlertState] = useState<{
    visible: boolean;
    icon: "check-green" | "delete";
    title: string;
    onClose?: () => void;
  }>({
    visible: false,
    icon: "check-green",
    title: "",
  });

  const isOtherSelected = selectedReasonId === OTHER_OPTION;
  const selectedReason = reasons.find((r) => r.id === selectedReasonId);
  const selectedLabel = isOtherSelected ? "Other" : selectedReason?.label;

  const orderNumber = order?.orderId
    ? String(order.orderId)
        .replace(/[^a-zA-Z_]/g, "")
        .slice(0, 2)
        .toUpperCase() + String(order.orderId).slice(-5)
    : undefined;
  const itemsCount = order?.items?.length ?? 0;
  const totalAmount = Number(order?.total ?? 0);

  const selectReason = (id: number | typeof OTHER_OPTION) => {
    setSelectedReasonId(id);
    setIsDropdownOpen(false);
    if (error) setError("");
  };

  const closeAlert = () => {
    const onClose = alertState.onClose;
    setAlertState((prev) => ({ ...prev, visible: false, onClose: undefined }));
    onClose?.();
  };

  const handleConfirm = async () => {
    const finalReason = isOtherSelected
      ? otherReason.trim()
      : selectedReason?.label;
    if (!finalReason) {
      setError(
        isOtherSelected
          ? "Please describe your reason for cancellation."
          : "Please select a reason for cancellation.",
      );
      return;
    }
    setError("");
    if (!orderId) return;

    setIsCancelling(true);
    try {
      await orderApi.cancelOrder(orderId, finalReason);
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CUSTOMER.ORDERS.BY_ID(orderId),
      });
      queryClient.invalidateQueries({
        queryKey: ["customer", "orders", "list"],
      });
      setAlertState({
        visible: true,
        icon: "check-green",
        title: "Order cancelled successfully!",
        onClose: () => {
          setTimeout(() => router.back(), 500);
        },
      });
    } catch (err) {
      if (__DEV__) console.error("[CancelOrder]", err);
      setAlertState({
        visible: true,
        icon: "delete",
        title: "Failed to cancel order. Please try again.",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  if (orderLoading) {
    return (
      <View className="flex-1 bg-[#F5F6FB]">
        <ScreenHeader title="Cancel Order" showBorder />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#0F7635" />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F5F6FB]">
      <ScreenHeader title="Cancel Order" showBorder />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: scale(20),
          paddingTop: verticalScale(24),
          paddingBottom:
            Math.max(bottomInset, verticalScale(24)) + verticalScale(120), // Extra padding for absolute footer
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Main Card */}
        {!!orderNumber && (
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: scale(16),
              padding: scale(20),
              width: "100%",
              borderWidth: 1,
              borderColor: "#919EAB33",
            }}
          >
            {/* Top Order summary section */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                width: "100%",
                paddingBottom: verticalScale(16),
                borderBottomWidth: 1,
                borderBottomColor: "#F3F4F6",
              }}
            >
              <View
                style={{
                  width: scale(40),
                  height: scale(40),
                  borderRadius: scale(20),
                  backgroundColor: "#FFF1F1",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: scale(12),
                }}
              >
                <icons.cancel_order_bag
                  width={moderateScale(20, 0.3)}
                  height={moderateScale(20, 0.3)}
                  fill="#E11D48"
                />
              </View>
              <View>
                <Text
                  style={{
                    fontSize: moderateScale(15, 0.3),
                    fontWeight: "700",
                    color: "#222222",
                  }}
                >
                  Order #{orderNumber}
                </Text>
                <Text
                  style={{
                    fontSize: moderateScale(12, 0.3),
                    fontWeight: "400",
                    color: "#6A6A6A",
                    marginTop: verticalScale(2),
                  }}
                >
                  {itemsCount} Items • ₹{totalAmount.toFixed(0)}
                </Text>
              </View>
            </View>

            {/* Title / Question */}
            <Text
              style={{
                fontSize: moderateScale(14, 0.3),
                fontWeight: "700",
                color: "#222222",
                marginTop: verticalScale(18),
                marginBottom: verticalScale(12),
              }}
            >
              Why do you want to cancel this order?
            </Text>

            {/* Options List */}
            {reasonsLoading ? (
              <ActivityIndicator
                color="#0F7635"
                style={{ marginVertical: verticalScale(20) }}
              />
            ) : (
              <View style={{ width: "100%" }}>
                {(() => {
                  const hasOther = reasons.some(
                    (r) =>
                      r.label.toLowerCase().includes("other") ||
                      (r.id as any) === OTHER_OPTION,
                  );
                  const displayReasons = [...reasons];
                  if (!hasOther) {
                    displayReasons.push({
                      id: OTHER_OPTION,
                      label: "Other Reason",
                      description: "Something else",
                    } as any);
                  }

                  return displayReasons.map((reason) => {
                    const isSelected = selectedReasonId === reason.id;
                    const config = getReasonConfig(reason.label);
                    const IconComponent = config.icon;

                    return (
                      <View key={reason.id} style={{ width: "100%" }}>
                        <Touchable
                          onPress={() => selectReason(reason.id)}
                          activeOpacity={0.7}
                          disabled={isCancelling}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            paddingVertical: verticalScale(12),
                            width: "100%",
                          }}
                        >
                          {/* Icon container */}
                          <View
                            style={{
                              width: scale(40),
                              height: scale(40),
                              borderRadius: scale(20),
                              backgroundColor: config.bgColor,
                              alignItems: "center",
                              justifyContent: "center",
                              marginRight: scale(12),
                            }}
                          >
                            {IconComponent && (
                              <IconComponent
                                width={moderateScale(20, 0.3)}
                                height={moderateScale(20, 0.3)}
                                fill={config.iconColor}
                              />
                            )}
                          </View>

                          {/* Labels */}
                          <View style={{ flex: 1, marginRight: scale(8) }}>
                            <Text
                              style={{
                                fontSize: moderateScale(14, 0.3),
                                fontWeight: "600",
                                color: "#222222",
                              }}
                            >
                              {reason.label}
                            </Text>
                            <Text
                              style={{
                                fontSize: moderateScale(12, 0.3),
                                color: "#9CA3AF",
                                marginTop: verticalScale(2),
                              }}
                            >
                              {reason.description || config.defaultDescription}
                            </Text>
                          </View>

                          {/* Radio circle */}
                          <View
                            style={{
                              width: scale(22),
                              height: scale(22),
                              borderRadius: scale(11),
                              borderWidth: 1.5,
                              borderColor: isSelected ? "#0F7635" : "#D1D5DB",
                              alignItems: "center",
                              justifyContent: "center",
                              backgroundColor: "#fff",
                            }}
                          >
                            {isSelected && (
                              <View
                                style={{
                                  width: scale(12),
                                  height: scale(12),
                                  borderRadius: scale(6),
                                  backgroundColor: "#0F7635",
                                }}
                              />
                            )}
                          </View>
                        </Touchable>

                        {/* If this specific option is selected and it is Other, show input field inside the card */}
                        {isSelected && isOtherSelected && (
                          <TextInput
                            placeholder="Enter cancellation reason..."
                            placeholderTextColor="#9CA3AF"
                            value={otherReason}
                            onChangeText={(value) => {
                              setOtherReason(value);
                              if (error && value.trim()) setError("");
                            }}
                            editable={!isCancelling}
                            multiline
                            numberOfLines={3}
                            style={{
                              width: "100%",
                              minHeight: verticalScale(80),
                              backgroundColor: "#fff",
                              borderWidth: 1,
                              borderColor: "#E5E7EB",
                              borderRadius: scale(10),
                              paddingHorizontal: scale(14),
                              paddingVertical: verticalScale(12),
                              fontWeight: "400",
                              fontSize: moderateScale(13, 0.3),
                              color: "#1A1C1E",
                              textAlignVertical: "top",
                              marginTop: verticalScale(4),
                              marginBottom: verticalScale(12),
                            }}
                          />
                        )}
                      </View>
                    );
                  });
                })()}
              </View>
            )}

            {/* Error display inside the card */}
            {!!error && (
              <Text
                style={{
                  width: "100%",
                  marginTop: verticalScale(8),
                  fontWeight: "400",
                  fontSize: moderateScale(12, 0.3),
                  color: "#DC2626",
                }}
              >
                {error}
              </Text>
            )}
          </View>
        )}
      </ScrollView>

      {/* Action button — Fixed Footer */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: scale(20),
          paddingTop: verticalScale(16),
          paddingBottom: bottomInset + verticalScale(16),
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#F3F4F6",
        }}
      >
        <Touchable
          onPress={handleConfirm}
          activeOpacity={0.85}
          disabled={isCancelling}
          style={[
            {
              width: "100%",
              paddingVertical: verticalScale(14),
              borderRadius: scale(12),
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#D32F2F", // brand/mockup red
            },
            isCancelling && { opacity: 0.7 },
          ]}
        >
          <Text
            style={{
              fontSize: moderateScale(16, 0.3),
              fontWeight: "700",
              color: "#fff",
            }}
          >
            {isCancelling ? "Cancelling..." : "Cancel Order"}
          </Text>
        </Touchable>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginTop: verticalScale(14),
            gap: scale(5),
          }}
        >
          <icons.lock_grey
            width={moderateScale(14, 0.3)}
            height={moderateScale(14, 0.3)}
          />
          <Text
            style={{
              fontSize: moderateScale(12, 0.3),
              fontWeight: "400",
              color: "#9CA3AF",
            }}
          >
            This action cannot be undone
          </Text>
        </View>
      </View>

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
}
