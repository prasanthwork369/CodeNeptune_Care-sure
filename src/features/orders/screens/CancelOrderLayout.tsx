import type { CancellationReason } from "@/src/features/orders/api/cancellation-reason.api";
import { orderApi } from "@/src/features/orders/api/order.api";
import { AlertDialog } from "@/src/components/ui/AlertDialog";
import { ConfirmActionModal } from "@/src/features/profile/components/ConfirmActionModal";
import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { useCancellationReasons } from "@/src/features/orders/hooks/useCancellationReasons";
import { useOrderById } from "@/src/features/orders/hooks/useOrderById";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { QUERY_KEYS } from "@/src/lib/react-query/queryKeys";
import { moderateScale, scale, verticalScale } from "@/src/utils/exactScale";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { formatOrderId } from "@/src/utils/order";
import { RemoteIcon } from "@/src/components/ui/RemoteIcon";
import { RequiredMark } from "@/src/components/ui/RequiredMark";
import { resolveAssetUrl } from "@/src/utils/urls";
import { requireInternet } from "@/src/utils/offline";
import { OTHER_OPTION } from "../constants/cancel.constants";
import { styles as s } from "./CancelOrderLayout.styles";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

// A backend reason, or the synthetic "Other" row — which carries a string id
// instead of the numeric ones the backend returns.
type DisplayReason =
  | CancellationReason
  | {
      id: typeof OTHER_OPTION;
      label: string;
      description: string;
      image_url?: null;
    };

export function CancelOrderLayout() {
  const queryClient = useQueryClient();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const bottomInset = useAdjustedBottomInset();
  const scrollRef =
    useRef<React.ComponentRef<typeof KeyboardAwareScrollView>>(null);

  const { order, loading: orderLoading } = useOrderById(orderId);
  const { data: reasons = [], isLoading: reasonsLoading } =
    useCancellationReasons();

  const [selectedReasonId, setSelectedReasonId] = useState<
    number | typeof OTHER_OPTION | null
  >(null);
  const [otherReason, setOtherReason] = useState("");
  const [error, setError] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [alertState, setAlertState] = useState<{
    visible: boolean;
    icon: "check-green" | "delete";
    title: string;
  }>({
    visible: false,
    icon: "check-green",
    title: "",
  });

  const isOtherSelected = selectedReasonId === OTHER_OPTION;
  const selectedReason = reasons.find((r) => r.id === selectedReasonId);
  const hasValidReason = isOtherSelected
    ? !!otherReason.trim()
    : !!selectedReason;

  const orderNumber = formatOrderId(order?.orderId || orderId);
  const itemsCount = order?.items?.length ?? 0;
  const totalAmount = Number(order?.total ?? 0);

  const selectReason = (id: number | typeof OTHER_OPTION) => {
    setSelectedReasonId(id);
    if (error) setError("");
    if (id !== OTHER_OPTION) {
      Keyboard.dismiss();
    }
  };

  const closeAlert = () => {
    setAlertState((prev) => ({ ...prev, visible: false }));
  };

  const handleCancelPress = () => {
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
    setShowConfirmModal(true);
  };

  const handleConfirm = async () => {
    const finalReason = isOtherSelected
      ? otherReason.trim()
      : selectedReason?.label;
    if (!finalReason || !orderId) return;
    // Critical: a cancellation the user believes succeeded but never reached
    // the server is worse than a blocking notice.
    if (!requireInternet({ critical: true })) return;

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
      setShowConfirmModal(false);
    }
  };

  if (orderLoading) {
    return (
      <View style={s.root}>
        <ScreenHeader title="Cancel Order" showBorder />
        <View style={s.loadingCenter}>
          <ActivityIndicator color="#0F7635" />
        </View>
      </View>
    );
  }

  return (
    <View style={s.root}>
      <ScreenHeader title="Cancel Order" showBorder />

      <KeyboardAwareScrollView
        ref={scrollRef}
        keyboardDismissMode="on-drag"
        bottomOffset={verticalScale(100)}
        contentContainerStyle={{
          paddingHorizontal: scale(20),
          paddingTop: verticalScale(24),
          paddingBottom:
            Math.max(bottomInset, verticalScale(24)) + verticalScale(120),
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        overScrollMode="auto"
      >
        {/* Main Card */}
        {!!orderNumber && (
          <View style={s.card}>
            {/* Top Order summary section */}
            <View style={s.orderSummaryRow}>
              <View style={s.bagIconBox}>
                <icons.cancel_order_bag
                  width={moderateScale(20)}
                  height={moderateScale(20)}
                  fill="#E11D48"
                />
              </View>
              <View>
                <Text style={s.orderNumberText}>
                  Order #{orderNumber}
                </Text>
                <Text style={s.orderMetaText}>
                  {itemsCount} Items • ₹{totalAmount.toFixed(0)}
                </Text>
              </View>
            </View>

            {/* Title / Question */}
            <Text style={s.questionText}>
              Why do you want to cancel this order?
              <RequiredMark />
            </Text>

            {/* Options List */}
            {reasonsLoading ? (
              <ActivityIndicator
                color="#0F7635"
                style={{ marginVertical: verticalScale(20) }}
              />
            ) : (
              <View style={s.reasonsContainer}>
                {(() => {
                  const hasOther = reasons.some((r) =>
                    r.label.toLowerCase().includes("other"),
                  );
                  const displayReasons: DisplayReason[] = [...reasons];
                  if (!hasOther) {
                    displayReasons.push({
                      id: OTHER_OPTION,
                      label: "Other Reason",
                      description: "Something else",
                    });
                  }

                  return (
                    <>
                      <View style={s.reasonsScrollArea}>
                        <ScrollView
                          nestedScrollEnabled={true}
                          showsVerticalScrollIndicator={true}
                          contentContainerStyle={s.reasonsScrollContent}
                        >
                          {displayReasons.map((reason) => {
                            const isSelected = selectedReasonId === reason.id;

                            return (
                              <View key={reason.id} style={s.reasonItemWrap}>
                                <Touchable
                                  onPress={() => selectReason(reason.id)}
                                  activeOpacity={0.7}
                                  disabled={isCancelling}
                                  style={s.reasonRow}
                                >
                                  {/* Icon container */}
                                  {!!reason.image_url && (
                                    <View style={s.reasonIconBox}>
                                      <RemoteIcon
                                        uri={resolveAssetUrl(reason.image_url)}
                                        size={scale(40)}
                                        style={{ borderRadius: scale(20) }}
                                      />
                                    </View>
                                  )}

                                  {/* Labels */}
                                  <View style={s.reasonTextCol}>
                                    <Text style={s.reasonLabel}>
                                      {reason.label}
                                    </Text>
                                    {!!reason.description && (
                                      <Text style={s.reasonDesc}>
                                        {reason.description}
                                      </Text>
                                    )}
                                  </View>

                                  {/* Radio circle */}
                                  <View
                                    style={[
                                      s.radioCircle,
                                      isSelected
                                        ? s.radioCircleSelected
                                        : s.radioCircleUnselected,
                                    ]}
                                  >
                                    {isSelected && (
                                      <View style={s.radioDot} />
                                    )}
                                  </View>
                                </Touchable>
                              </View>
                            );
                          })}
                        </ScrollView>
                      </View>

                      {/* If Other is selected, show input field outside of the scrollable reasons list */}
                      {isOtherSelected && (
                        <TextInput
                          placeholder="Enter cancellation reason..."
                          placeholderTextColor="#6A6A6A"
                          value={otherReason}
                          onChangeText={(value) => {
                            setOtherReason(value);
                            if (error && value.trim()) setError("");
                          }}
                          editable={!isCancelling}
                          multiline
                          numberOfLines={3}
                          style={s.otherInput}
                        />
                      )}
                    </>
                  );
                })()}
              </View>
            )}

            {/* Error display inside the card */}
            {!!error && (
              <Text style={s.errorText}>
                {error}
              </Text>
            )}
          </View>
        )}
      </KeyboardAwareScrollView>

      {/* Action button — Fixed Footer */}
      <View
        style={[
          s.footer,
          { paddingBottom: bottomInset + verticalScale(16) },
        ]}
      >
        <Touchable
          testID="cancel-order-submit"
          onPress={handleCancelPress}
          activeOpacity={0.85}
          disabled={isCancelling || !hasValidReason}
          style={[
            s.submitBtn,
            (isCancelling || !hasValidReason) && s.submitBtnDisabled,
          ]}
        >
          <Text style={s.submitBtnText}>
            {isCancelling ? "Cancelling..." : "Cancel Order"}
          </Text>
        </Touchable>
        <View style={s.footerNotice}>
          <icons.lock_grey
            width={moderateScale(14)}
            height={moderateScale(14)}
          />
          <Text style={s.footerNoticeText}>
            This action cannot be undone
          </Text>
        </View>
      </View>

      <ConfirmActionModal
        isVisible={showConfirmModal}
        message="Confirm Cancellation"
        description="Are you sure you want to cancel this order?"
        icon={<icons.cancel_order_bag width={36} height={36} fill="#E11D48" />}
        confirmLabel="Cancel"
        cancelLabel="Keep"
        confirmTestID="cancel-order-confirm"
        isLoading={isCancelling}
        onCancel={() => setShowConfirmModal(false)}
        onConfirm={handleConfirm}
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
}
