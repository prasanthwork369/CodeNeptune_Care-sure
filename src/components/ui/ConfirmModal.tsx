import { icons } from "@/src/constants/icons";
import { Touchable } from "@/src/components/ui/Touchable";
import { Image, type ImageSource } from "expo-image";
import React from "react";
import { ActivityIndicator, Modal, Pressable, Text, View } from "react-native";
import { exactScale } from "@/src/utils/exactScale";
import { styles as s } from "./ConfirmModal.styles";

/** Generic reusable confirm modal. No domain-specific defaults. */
export interface ConfirmModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  icon?: ImageSource;
  iconBg?: string;
  confirmBg?: string;
  showConfirmIcon?: boolean;
  // Swaps the confirm button into a spinner + confirmLoadingLabel, and
  // blocks repeat taps. Caller owns the state — this only renders it.
  confirmLoading?: boolean;
  confirmLoadingLabel?: string;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  onConfirm,
  onCancel,
  title,
  message,
  confirmLabel,
  cancelLabel,
  icon,
  iconBg = "#FDEAEA",
  confirmBg = "#C22923",
  showConfirmIcon = true,
  confirmLoading = false,
  confirmLoadingLabel,
}) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    statusBarTranslucent
    onRequestClose={onCancel}
  >
    <Pressable
      style={s.backdropPressable}
      onPress={onCancel}
    >
      <Pressable onPress={(e) => e.stopPropagation()} style={s.modalContentPressable}>
        <View style={s.modalCard}>
          {icon && (
            <Touchable
              onPress={onCancel}
              style={s.closeBtn}
            >
              <icons.close_dark width={exactScale(14)} height={exactScale(14)} />
            </Touchable>
          )}

          {icon && (
            <View
              style={[s.iconCircle, { backgroundColor: iconBg }]}
            >
              <Image
                source={icon}
                style={{ width: exactScale(36), height: exactScale(36) }}
                contentFit="contain"
              />
            </View>
          )}

          <Text
            style={[s.titleText, icon ? { textAlign: "center" } : undefined]}
          >
            {title}
          </Text>
          <Text
            style={[s.messageText, icon ? { textAlign: "center" } : undefined]}
          >
            {message}
          </Text>
          <View style={s.buttonRow}>
            <Touchable
              activeOpacity={0.7}
              style={s.cancelButton}
              onPress={onCancel}
            >
              <Text style={s.cancelButtonText}>
                {cancelLabel}
              </Text>
            </Touchable>
            <Touchable
              activeOpacity={0.85}
              disabled={confirmLoading}
              style={[s.confirmButton, { backgroundColor: confirmBg }]}
              onPress={onConfirm}
            >
              {confirmLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                !icon && showConfirmIcon && (
                  <icons.delete_white width={exactScale(16)} height={exactScale(16)} fill="#FFFFFF" />
                )
              )}
              <Text style={s.confirmButtonText}>
                {confirmLoading ? (confirmLoadingLabel ?? confirmLabel) : confirmLabel}
              </Text>
            </Touchable>
          </View>
        </View>
      </Pressable>
    </Pressable>
  </Modal>
);
