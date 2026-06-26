import { ReasonDropdown } from "@/src/components/ui/ReasonDropdown";
import { Touchable } from "@/src/components/ui/Touchable";
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
          paddingHorizontal: 20,
          paddingTop: 24,
          paddingBottom: Math.max(bottomInset, 24) + 120, // Extra padding for absolute footer
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ alignItems: "center" }}>
          {/* Cancel Icon */}
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: "#FFF1F1",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 18,
            }}
          >
            <icons.return_package width={30} height={30} />
          </View>

          {/* Title */}
          <Text
            style={{
              fontSize: 19,
              fontWeight: "700",
              color: "#222222",
              textAlign: "center",
              marginBottom: 8,
              lineHeight: 24,
            }}
          >
            Cancel this order?
          </Text>

          {/* Subtitle */}
          <Text
            style={{
              fontSize: 13,
              fontWeight: "400",
              color: "#6A6A6A",
              textAlign: "center",
              marginBottom: 24,
              lineHeight: 18,
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
                borderRadius: 14,
                paddingVertical: 12,
                paddingHorizontal: 14,
                marginBottom: 20,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: "#FFF1F1",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                }}
              >
                <icons.return_package width={18} height={18} />
              </View>
              <View>
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#222222" }}>
                  Order #{orderNumber}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "400",
                    color: "#6A6A6A",
                    marginTop: 2,
                  }}
                >
                  {itemsCount} Items • ₹{totalAmount.toFixed(0)}
                </Text>
              </View>
            </View>
          )}

          {reasonsLoading ? (
            <ActivityIndicator color="#0F7635" style={{ marginBottom: 20 }} />
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
                minHeight: 80,
                backgroundColor: "#fff",
                borderWidth: 1,
                borderColor: "#E5E7EB",
                borderRadius: 10,
                paddingHorizontal: 14,
                paddingVertical: 12,
                fontWeight: "400",
                fontSize: 13,
                color: "#1A1C1E",
                textAlignVertical: "top",
                marginTop: 12,
                marginBottom: 4,
              }}
            />
          )}

          {!!error && (
            <Text
              style={{
                width: "100%",
                marginTop: 8,
                marginBottom: 4,
                fontWeight: "400",
                fontSize: 12,
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
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: Math.max(bottomInset, 20),
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#F3F4F6",
        }}
      >
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Touchable
            onPress={() => router.back()}
            activeOpacity={0.85}
            disabled={isCancelling}
            style={[
              {
                flex: 1,
                paddingVertical: 13,
                borderRadius: 10,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#fff",
                borderWidth: 1,
                borderColor: "#E5E7EB",
              },
              isCancelling && { opacity: 0.5 },
            ]}
          >
            <Text style={{ fontSize: 14, fontWeight: "400", color: "#111827" }}>
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
                paddingVertical: 13,
                borderRadius: 10,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#EF4444",
              },
              isCancelling && { opacity: 0.7 },
            ]}
          >
            <Text style={{ fontSize: 15, fontWeight: "700", color: "#fff" }}>
              {isCancelling ? "Cancelling..." : "Cancel Order"}
            </Text>
          </Touchable>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 14,
            gap: 5,
          }}
        >
          <icons.lock_grey width={14} height={14} />
          <Text style={{ fontSize: 12, fontWeight: "400", color: "#9CA3AF" }}>
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
