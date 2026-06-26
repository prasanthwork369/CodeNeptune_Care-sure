import { ReasonDropdown } from "@/src/components/ui/ReasonDropdown";
import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { useCancellationReasons } from "@/src/hooks/queries/useCancellationReasons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Modal, Text, TextInput, View } from "react-native";

interface CancelOrderDialogProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  loading?: boolean;
  orderNumber?: string;
  itemsCount?: number;
  totalAmount?: number;
}

const OTHER_OPTION = "__other__";

export function CancelOrderDialog({
  visible,
  onClose,
  onConfirm,
  loading = false,
  orderNumber,
  itemsCount,
  totalAmount,
}: CancelOrderDialogProps) {
  const { data: reasons = [], isLoading: reasonsLoading } =
    useCancellationReasons();
  const [selectedReasonId, setSelectedReasonId] = useState<
    number | typeof OTHER_OPTION | null
  >(null);
  const [otherReason, setOtherReason] = useState("");
  const [error, setError] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (visible) {
      setSelectedReasonId(null);
      setOtherReason("");
      setError("");
      setIsDropdownOpen(false);
    }
  }, [visible]);

  const isOtherSelected = selectedReasonId === OTHER_OPTION;
  const selectedReason = reasons.find((r) => r.id === selectedReasonId);
  const selectedLabel = isOtherSelected ? "Other" : selectedReason?.label;

  const selectReason = (id: number | typeof OTHER_OPTION) => {
    setSelectedReasonId(id);
    setIsDropdownOpen(false);
    if (error) setError("");
  };

  const handleConfirm = () => {
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
    onConfirm(finalReason);
    setError("");
  };

  const handleClose = () => {
    setError("");
    setIsDropdownOpen(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      {/* Full-screen backdrop — tapping it closes dropdown first, then modal */}
      <Touchable
        activeOpacity={1}
        onPress={() => {
          if (isDropdownOpen) {
            setIsDropdownOpen(false);
          } else {
            handleClose();
          }
        }}
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 24,
        }}
      >
        {/* Modal card — fixed layout, does NOT grow when dropdown opens */}
        <Touchable
          activeOpacity={1}
          onPress={() => {
            // Absorb taps inside the card so backdrop handler doesn't fire
            if (isDropdownOpen) setIsDropdownOpen(false);
          }}
          style={{
            backgroundColor: "#fff",
            borderRadius: 20,
            width: "100%",
            paddingHorizontal: 24,
            paddingTop: 32,
            paddingBottom: 24,
            alignItems: "center",
          }}
        >
          {/* Close button */}
          <Touchable
            onPress={handleClose}
            disabled={loading}
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: "#F3F4F6",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <icons.close_small width={12} height={12} />
          </Touchable>

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
              marginBottom: 16,
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
                borderRadius: 14,
                paddingVertical: 12,
                paddingHorizontal: 14,
                marginBottom: 16,
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
                <Text
                  style={{ fontSize: 14, fontWeight: "700", color: "#222222" }}
                >
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
                  {itemsCount ?? 0} Items • ₹
                  {Number(totalAmount ?? 0).toFixed(0)}
                </Text>
              </View>
            </View>
          )}

          {reasonsLoading ? (
            <ActivityIndicator color="#0F7635" style={{ marginBottom: 20 }} />
          ) : (
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
              disabled={loading}
              placeholder="Select the reason"
            />
          )}

          {/* Spacer so dropdown has room to float over buttons */}
          <View style={{ height: isDropdownOpen ? 220 : 0 }} />

          {isOtherSelected && (
            <TextInput
              placeholder="Enter cancellation reason..."
              placeholderTextColor="#9CA3AF"
              value={otherReason}
              onChangeText={(value) => {
                setOtherReason(value);
                if (error && value.trim()) setError("");
              }}
              editable={!loading}
              multiline
              numberOfLines={3}
              autoFocus
              style={{
                width: "100%",
                minHeight: 80,
                backgroundColor: "#F9FAFB",
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

          {/* Action buttons — always stay at the bottom, never pushed away */}
          <View
            style={{
              flexDirection: "row",
              gap: 10,
              width: "100%",
              marginTop: 20,
            }}
          >
            <Touchable
              onPress={handleClose}
              activeOpacity={0.85}
              disabled={loading}
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
                loading && { opacity: 0.5 },
              ]}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "400",
                  color: "#111827",
                }}
              >
                Keep Order
              </Text>
            </Touchable>

            <Touchable
              onPress={handleConfirm}
              activeOpacity={0.85}
              disabled={loading}
              style={[
                {
                  flex: 1,
                  paddingVertical: 13,
                  borderRadius: 10,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#EF4444",
                },
                loading && { opacity: 0.7 },
              ]}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "700",
                  color: "#fff",
                }}
              >
                {loading ? "Cancelling..." : "Cancel Order"}
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
            <Text
              style={{
                fontSize: 12,
                fontWeight: "400",
                color: "#9CA3AF",
              }}
            >
              This action cannot be undone
            </Text>
          </View>
        </Touchable>
      </Touchable>
    </Modal>
  );
}
