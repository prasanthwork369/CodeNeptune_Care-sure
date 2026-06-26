import { ReasonDropdown } from "@/src/components/ui/ReasonDropdown";
import { Touchable } from "@/src/components/ui/Touchable";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { icons } from "@/src/constants/icons";
import { useCancellationReasons } from "@/src/hooks/queries/useCancellationReasons";
import { useOrderById } from "@/src/hooks/queries/useOrderById";
import { useNav } from "@/src/hooks/useNav";
import { orderApi } from "@/src/api/order.api";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/src/lib/react-query/queryKeys";
import { useLocalSearchParams } from "expo-router";
import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { AlertDialog } from "@/src/components/ui/AlertDialog";
import React, { useState } from "react";
import { ActivityIndicator, Text, TextInput, View, ScrollView } from "react-native";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";

const OTHER_OPTION = "__other__";

export function CancelOrderLayout() {
  const router = useNav();
  const queryClient = useQueryClient();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const bottomInset = useAdjustedBottomInset();

  const { order, loading: orderLoading } = useOrderById(orderId);
  const { data: reasons = [], isLoading: reasonsLoading } = useCancellationReasons();

  const [selectedReasonId, setSelectedReasonId] = useState<number | typeof OTHER_OPTION | null>(null);
  const [otherReason, setOtherReason] = useState("");
  const [error, setError] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [alertState, setAlertState] = useState<{
    visible: boolean;
    icon: 'check-green' | 'delete';
    title: string;
    onClose?: () => void;
  }>({
    visible: false,
    icon: 'check-green',
    title: '',
  });

  const isOtherSelected = selectedReasonId === OTHER_OPTION;
  const selectedReason = reasons.find((r) => r.id === selectedReasonId);
  const selectedLabel = isOtherSelected ? "Other" : selectedReason?.label;

  const orderNumber = order?.orderId
    ? String(order.orderId).replace(/[^a-zA-Z_]/g, "").slice(0, 2).toUpperCase() +
      String(order.orderId).slice(-5)
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
    const finalReason = isOtherSelected ? otherReason.trim() : selectedReason?.label;
    if (!finalReason) {
      setError(
        isOtherSelected
          ? "Please describe your reason for cancellation."
          : "Please select a reason for cancellation."
      );
      return;
    }
    setError("");
    if (!orderId) return;

    setIsCancelling(true);
    try {
      await orderApi.cancelOrder(orderId, finalReason);
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
    } catch (err) {
      if (__DEV__) console.error('[CancelOrder]', err);
      setAlertState({
        visible: true,
        icon: 'delete',
        title: 'Failed to cancel order. Please try again.',
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
          paddingHorizontal: exactScale(20),
          paddingTop: exactScale(24),
          paddingBottom: Math.max(bottomInset, exactScale(24)) + exactScale(120), // Extra padding for absolute footer
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ alignItems: "center" }}>
          {/* Cancel Icon */}
          <View
            style={{
              width: exactScale(64),
              height: exactScale(64),
              borderRadius: exactScale(32),
              backgroundColor: "#FFF1F1",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: exactScale(18),
            }}
          >
            <icons.return_package width={exactScale(30)} height={exactScale(30)} />
          </View>

          {/* Title */}
          <Text
            style={{
              fontSize: moderateScale(19),
              fontWeight: "700",
              color: "#222222",
              textAlign: "center",
              marginBottom: exactScale(8),
              lineHeight: moderateScale(24),
            }}
          >
            Cancel this order?
          </Text>

          {/* Subtitle */}
          <Text
            style={{
              fontSize: moderateScale(13),
              fontWeight: "400",
              color: "#6A6A6A",
              textAlign: "center",
              marginBottom: exactScale(24),
              lineHeight: moderateScale(18),
            }}
          >
            Please share the reason for cancellation
          </Text>

          {!!orderNumber && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                width: "100%",
                borderWidth: 1,
                borderColor: "#E5E7EB",
                backgroundColor: "#fff",
                borderRadius: exactScale(14),
                paddingVertical: exactScale(12),
                paddingHorizontal: exactScale(14),
                marginBottom: exactScale(20),
              }}
            >
              <View
                style={{
                  width: exactScale(40),
                  height: exactScale(40),
                  borderRadius: exactScale(20),
                  backgroundColor: "#FFF1F1",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: exactScale(12),
                }}
              >
                <icons.return_package width={exactScale(18)} height={exactScale(18)} />
              </View>
              <View>
                <Text style={{ fontSize: moderateScale(14), fontWeight: "700", color: "#222222" }}>
                  Order #{orderNumber}
                </Text>
                <Text
                  style={{
                    fontSize: moderateScale(12),
                    fontWeight: "400",
                    color: "#6A6A6A",
                    marginTop: exactScale(2),
                  }}
                >
                  {itemsCount} Items • ₹{totalAmount.toFixed(0)}
                </Text>
              </View>
            </View>
          )}

          {reasonsLoading ? (
            <ActivityIndicator color="#0F7635" style={{ marginBottom: exactScale(20) }} />
          ) : (
            <View style={{ width: "100%", zIndex: 10 }}>
              <ReasonDropdown
                options={reasons}
                isOpen={isDropdownOpen}
                onToggle={() => setIsDropdownOpen((v) => !v)}
                selectedLabel={selectedLabel}
                selectedId={selectedReasonId}
                onSelect={(id) => selectReason(id as number)}
                includeOther
                isOtherSelected={isOtherSelected}
                onSelectOther={() => selectReason(OTHER_OPTION)}
                disabled={isCancelling}
                placeholder="Select the reason"
              />
            </View>
          )}

          {isOtherSelected && (
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
                minHeight: exactScale(80),
                backgroundColor: "#fff",
                borderWidth: 1,
                borderColor: "#E5E7EB",
                borderRadius: exactScale(10),
                paddingHorizontal: exactScale(14),
                paddingVertical: exactScale(12),
                fontWeight: "400",
                fontSize: moderateScale(13),
                color: "#1A1C1E",
                textAlignVertical: "top",
                marginTop: exactScale(12),
                marginBottom: exactScale(4),
              }}
            />
          )}

          {!!error && (
            <Text
              style={{
                width: "100%",
                marginTop: exactScale(8),
                marginBottom: exactScale(4),
                fontWeight: "400",
                fontSize: moderateScale(12),
                color: "#DC2626",
              }}
            >
              {error}
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Action buttons — Fixed Footer */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: exactScale(20),
          paddingTop: exactScale(16),
          paddingBottom: Math.max(bottomInset, exactScale(20)),
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#F3F4F6",
        }}
      >
        <View style={{ flexDirection: "row", gap: exactScale(10) }}>
          <Touchable
            onPress={() => router.back()}
            activeOpacity={0.85}
            disabled={isCancelling}
            style={[
              {
                flex: 1,
                paddingVertical: exactScale(13),
                borderRadius: exactScale(10),
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#fff",
                borderWidth: 1,
                borderColor: "#E5E7EB",
              },
              isCancelling && { opacity: 0.5 },
            ]}
          >
            <Text style={{ fontSize: moderateScale(14), fontWeight: "400", color: "#111827" }}>
              Keep Order
            </Text>
          </Touchable>

          <Touchable
            onPress={handleConfirm}
            activeOpacity={0.85}
            disabled={isCancelling}
            style={[
              {
                flex: 1,
                paddingVertical: exactScale(13),
                borderRadius: exactScale(10),
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#EF4444",
              },
              isCancelling && { opacity: 0.7 },
            ]}
          >
            <Text style={{ fontSize: moderateScale(15), fontWeight: "700", color: "#fff" }}>
              {isCancelling ? "Cancelling..." : "Cancel Order"}
            </Text>
          </Touchable>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginTop: exactScale(14),
            gap: exactScale(5),
          }}
        >
          <icons.lock_grey width={exactScale(14)} height={exactScale(14)} />
          <Text style={{ fontSize: moderateScale(12), fontWeight: "400", color: "#9CA3AF" }}>
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
            label: 'OK',
            onPress: closeAlert,
            variant: 'green',
          },
        ]}
      />
    </View>
  );
}
