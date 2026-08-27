import { Touchable } from "@/src/components/ui/Touchable";
import React from "react";
import { ActivityIndicator, Modal, Text, View } from "react-native";
import { moderateScale } from "@/src/utils/exactScale";

interface ConfirmActionModalProps {
  isVisible: boolean;
  message: string;
  /** Optional secondary line below the message, for a title + detail layout. */
  description?: string;
  /** Icon shown in the round pink badge. Receives width/height/fill. */
  icon: React.ReactNode;
  /** Copy for the destructive confirm button. Defaults to "Yes". */
  confirmLabel?: string;
  /** Copy for the dismiss button. Defaults to "No". */
  cancelLabel?: string;
  isLoading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  confirmTestID?: string;
  cancelTestID?: string;
}

/**
 * Reusable confirm popup — the profile logout dialog look (round pink icon
 * badge, centered message, No / destructive-Yes buttons). Shared so logout and
 * delete-account confirmations stay visually identical.
 */
export const ConfirmActionModal: React.FC<ConfirmActionModalProps> = ({
  isVisible,
  message,
  description,
  icon,
  confirmLabel = "Yes",
  cancelLabel = "No",
  isLoading,
  onCancel,
  onConfirm,
  confirmTestID,
  cancelTestID,
}) => {
  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onCancel}
    >
      <View className="flex-1 bg-black/60 items-center justify-center px-6">
        <View
          className="bg-white w-full items-center"
          style={{
            borderRadius: 16,
            paddingHorizontal: 24,
            paddingTop: 28,
            paddingBottom: 24,
          }}
        >
          {/* Icon — oval pink bg */}
          <View
            style={{
              width: 90,
              height: 90,
              borderRadius: 45,
              backgroundColor: "#FFE4E4",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 18,
            }}
          >
            {icon}
          </View>

          {/* Message */}
          <Text
            className="font-inter-bold text-[#1A1C1E] text-center"
            style={{
              fontSize: moderateScale(16),
              marginBottom: description ? 8 : 24,
            }}
          >
            {message}
          </Text>
          {!!description && (
            <Text
              className="font-inter-medium text-[#6A6A6A] text-center"
              style={{ fontSize: moderateScale(13), marginBottom: 24 }}
            >
              {description}
            </Text>
          )}

          {/* Buttons */}
          <View className="flex-row w-full" style={{ gap: 10 }}>
            <Touchable
              testID={cancelTestID}
              onPress={onCancel}
              disabled={isLoading}
              activeOpacity={0.8}
              style={{
                flex: 1,
                paddingVertical: 13,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: "#DDDDDD",
                backgroundColor: "#FFFFFF",
                alignItems: "center",
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              <Text
                className="font-inter-semibold text-[#1A1C1E]"
                style={{ fontSize: moderateScale(15) }}
              >
                {cancelLabel}
              </Text>
            </Touchable>

            <Touchable
              testID={confirmTestID}
              onPress={onConfirm}
              disabled={isLoading}
              activeOpacity={0.8}
              style={{
                flex: 1,
                paddingVertical: 13,
                borderRadius: 999,
                backgroundColor: "#E53935",
                alignItems: "center",
              }}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text
                  className="font-inter-semibold text-white"
                  style={{ fontSize: moderateScale(15) }}
                >
                  {confirmLabel}
                </Text>
              )}
            </Touchable>
          </View>
        </View>
      </View>
    </Modal>
  );
};
