import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { useOtp } from "@/src/hooks/useOtp";
import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { scale } from "react-native-size-matters";
import { styles as s } from "./OtpLayout.styles";
import { AuthFooter } from "./sections/AuthFooter";
import { AuthScreenShell } from "./sections/AuthScreenShell";
import { OtpForm } from "./sections/OtpForm";
import { styles as formStyles } from "./sections/OtpForm.styles";

// Formats a raw phone number (e.g. +919444444444) into +91 94444 44444 for cleaner display on screen
const formatPhoneNumber = (rawPhone: string) => {
  if (!rawPhone) return "";
  const cleaned = rawPhone.replace(/\s+/g, '');
  // Format only standard Indian phone numbers (+91 followed by 10 digits)
  if (cleaned.startsWith('+91') && cleaned.length === 13) {
    return `+91 ${cleaned.slice(3, 8)} ${cleaned.slice(8)}`;
  }
  return rawPhone;
};

/**
 * Presentation component for the OTP Verification screen.
 * Delegates all lifecycle effects, timers, SMS integrations, and mutation actions to `useOtp`.
 */
export const OtpLayout: React.FC = () => {
  const {
    router,
    phone,
    otp,
    otpError,
    error,
    resendCooldown,
    isButtonLoading,
    isValid,
    inputRefs,
    handleResend,
    handleOtpChange,
    handleKeyPress,
    handleVerify,
  } = useOtp();

  return (
    <AuthScreenShell
      onSkip={() => router.replace("/(tabs)")}
      footer={
        <View>
          <View className="items-start" style={s.headerContainer}>
            <Text style={s.title}>Verify OTP</Text>
            <View style={s.phoneRow}>
              <Text style={s.phone}>{formatPhoneNumber(phone || "")}</Text>
              <Touchable
                onPress={() => router.back()}
                accessibilityRole="button"
                accessibilityLabel="Edit phone number"
              >
                <Text style={s.editBtn}>Edit</Text>
              </Touchable>
            </View>
          </View>

          <OtpForm
            otp={otp}
            otpError={otpError}
            error={error}
            loading={isButtonLoading}
            resendCooldown={resendCooldown}
            onOtpChange={handleOtpChange}
            onKeyPress={handleKeyPress}
            onResend={handleResend}
            inputRefs={inputRefs}
          />

          <Touchable
            activeOpacity={0.8}
            onPress={handleVerify}
            disabled={isButtonLoading || !isValid}
            accessibilityRole="button"
            accessibilityLabel="Verify and continue"
            style={[
              formStyles.btn,
              { opacity: isButtonLoading || !isValid ? 0.6 : 1 },
            ]}
          >
            {isButtonLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={formStyles.btnText}>Verify & Continue</Text>
                <icons.arrow_forward_white
                  width={13}
                  height={13}
                  fill="#ffffff"
                />
              </>
            )}
          </Touchable>
          <View style={s.spacer} />
          <AuthFooter />
        </View>
      }
    />
  );
};
