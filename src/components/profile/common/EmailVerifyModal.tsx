import { OtpForm } from "@/src/components/auth/sections/OtpForm";
import { Touchable } from "@/src/components/ui/Touchable";
import { useEmailVerification } from "@/src/hooks/mutations/useEmailVerification";
import { useOtpInput } from "@/src/hooks/ui/useOtpInput";
import { moderateScale } from "@/src/utils/exactScale";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
    StyleSheet,
    Text,
    useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface EmailVerifyModalProps {
  isVisible: boolean;
  email: string;
  onClose: () => void;
  onVerified: () => void;
}

const RESEND_SECONDS = 30;

/**
 * Modal popup that verifies an email: shows 6 OTP boxes, confirms the code
 * the backend emailed, and reports success upward. Reuses the login OtpForm for
 * the boxes and useOtpInput for the typing behaviour, so there's one OTP UX.
 */
export const EmailVerifyModal: React.FC<EmailVerifyModalProps> = ({
  isVisible,
  email,
  onClose,
  onVerified,
}) => {
  const { height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const {
    verify,
    verifying,
    verifyError,
    resetVerifyError,
    requestVerify,
    requesting,
  } = useEmailVerification();
  const [resendCooldown, setResendCooldown] = useState(RESEND_SECONDS);

  const handleVerify = async (code: string) => {
    try {
      await verify(code);
      onVerified();
    } catch {
      // Wrong/expired code — clear the boxes so the user can retype.
      // The error text is surfaced from verifyError below.
      otp.reset();
    }
  };

  const otp = useOtpInput(handleVerify);

  // Reset OTP + countdown + any stale error each time the modal opens. The
  // modal stays mounted (only `visible` toggles), so a previous "Invalid OTP"
  // error would otherwise linger when reopened for a new email.
  useEffect(() => {
    if (!isVisible) return;
    setResendCooldown(RESEND_SECONDS);
    otp.reset();
    resetVerifyError();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  useEffect(() => {
    if (resendCooldown === 0) return;
    const timer = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleResend = async () => {
    if (resendCooldown > 0 || requesting) return;
    try {
      await requestVerify(email);
      otp.reset();
      setResendCooldown(RESEND_SECONDS);
    } catch {
      // Request failure is non-fatal; user can tap resend again.
    }
  };

  // Clear any stale "Invalid OTP" error as soon as the user retypes.
  const handleChange = (value: string) => {
    if (verifyError) resetVerifyError();
    otp.handleOtpChange(value);
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      presentationStyle="overFullScreen"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      {/*
       * KeyboardAvoidingView MUST be the direct child of Modal.
       * Nesting it inside a Pressable breaks avoidance on both platforms.
       * It fills the whole screen; the backdrop Pressable lives inside it.
       */}
      <KeyboardAvoidingView
        style={s.keyboardAvoiding}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Dim backdrop — tapping outside the card closes the modal */}
        <Pressable style={s.backdrop} onPress={onClose}>
          {/* Card — stop backdrop-close when the user taps inside */}
          <Pressable
            style={[
              s.card,
              {
                maxHeight: Math.max(
                  0,
                  screenHeight - insets.top - insets.bottom - 32,
                ),
              },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <ScrollView
              bounces={false}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={s.cardContent}
            >
              <Text style={s.title}>Verify Email</Text>
              <Text style={s.subtitle}>
                Enter the 6-digit code sent to{"\n"}
                <Text style={s.emailHighlight}>{email}</Text>
              </Text>

              <OtpForm
                slots={otp.slots}
                inputValue={otp.inputValue}
                otpError=""
                error={verifyError}
                loading={verifying || requesting}
                resendCooldown={resendCooldown}
                activeIndex={otp.activeIndex}
                onBoxPress={otp.handleBoxPress}
                onOtpChange={handleChange}
                onResend={handleResend}
                inputRef={otp.inputRef}
              />

              <Touchable
                onPress={() => handleVerify(otp.code)}
                disabled={otp.code.length !== 6 || verifying}
                activeOpacity={0.85}
                style={[
                  s.verifyBtn,
                  { opacity: otp.code.length !== 6 || verifying ? 0.5 : 1 },
                ]}
              >
                {verifying ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={s.verifyBtnText}>Verify</Text>
                )}
              </Touchable>

              <Touchable
                onPress={onClose}
                activeOpacity={0.7}
                style={s.cancelBtn}
              >
                <Text style={s.cancelBtnText}>Cancel</Text>
              </Touchable>
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const s = StyleSheet.create({
  /* Fills the entire screen and provides the dim overlay — bg color here
   * covers the navigation bar area (navigationBarTranslucent only allows it,
   * the View's flex:1 actually fills it). Mirrors LogoutConfirmModal pattern. */
  keyboardAvoiding: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  /* Transparent layout container — centers the card; tapping outside closes */
  backdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  /* White card that holds all OTP content */
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    width: "100%",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
  cardContent: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 20,
  },
  title: {
    fontSize: moderateScale(17),
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: moderateScale(13),
    color: "#6A6A6A",
    textAlign: "center",
    marginBottom: 4,
    lineHeight: moderateScale(20),
  },
  emailHighlight: {
    fontWeight: "600",
    color: "#111827",
  },
  verifyBtn: {
    backgroundColor: "#0F7635",
    borderRadius: 10,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  verifyBtnText: {
    fontSize: moderateScale(15),
    fontWeight: "600",
    color: "#FFFFFF",
  },
  cancelBtn: {
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 4,
  },
  cancelBtnText: {
    fontSize: moderateScale(14),
    fontWeight: "500",
    color: "#6B7280",
  },
});
