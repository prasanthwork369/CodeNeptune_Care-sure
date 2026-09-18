import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { exactScale } from "@/src/utils/exactScale";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { styles as s } from "./CancelReturnModal.styles";

interface CancelReturnModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isCancelling?: boolean;
}

const MAX_REASON = 1000;

/** Reason is required, same as the website's cancel-return modal. */
export const CancelReturnModal: React.FC<CancelReturnModalProps> = ({
  visible,
  onClose,
  onConfirm,
  isCancelling = false,
}) => {
  const [reason, setReason] = useState("");

  // Clears the field each time the modal opens. Adjusted during render rather
  // than in an effect — same pattern as UploadPrescriptionSheet.
  const [prevVisible, setPrevVisible] = useState(visible);
  if (visible !== prevVisible) {
    setPrevVisible(visible);
    if (visible) setReason("");
  }

  const trimmed = reason.trim();
  const canSubmit = trimmed.length > 0 && !isCancelling;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable style={s.backdrop} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={s.centerWrap}
        >
          <Pressable onPress={(e) => e.stopPropagation()} style={s.cardWrap}>
            <View style={s.card}>
              <Touchable onPress={onClose} style={s.closeBtn}>
                <icons.close_dark
                  width={exactScale(14)}
                  height={exactScale(14)}
                />
              </Touchable>

              <Text style={s.title}>Cancel Return Request?</Text>
              <Text style={s.message}>
                Tell us why you no longer want this return. Our team will see
                this note.
              </Text>

              <TextInput
                style={s.input}
                value={reason}
                onChangeText={setReason}
                placeholder="Reason for cancelling"
                placeholderTextColor="#9CA3AF"
                multiline
                maxLength={MAX_REASON}
                editable={!isCancelling}
                textAlignVertical="top"
              />

              <View style={s.buttonRow}>
                <Touchable
                  activeOpacity={0.7}
                  style={s.keepButton}
                  onPress={onClose}
                  disabled={isCancelling}
                >
                  <Text style={s.keepButtonText}>Keep Return</Text>
                </Touchable>
                <Touchable
                  activeOpacity={0.85}
                  style={[s.confirmButton, !canSubmit && s.confirmDisabled]}
                  onPress={() => canSubmit && onConfirm(trimmed)}
                  disabled={!canSubmit}
                >
                  {isCancelling ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : null}
                  <Text style={s.confirmButtonText}>
                    {isCancelling ? "Cancelling…" : "Cancel Return"}
                  </Text>
                </Touchable>
              </View>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
};
