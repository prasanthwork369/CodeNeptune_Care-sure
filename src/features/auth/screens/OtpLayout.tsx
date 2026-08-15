import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { AuthFooter } from "../components/AuthFooter";
import { AuthScreenShell } from "../components/AuthScreenShell";
import { OtpForm } from "../components/OtpForm";
import { styles as formStyles } from "../components/OtpForm.styles";
import { useOtp } from "../hooks/useOtp";
import { styles as s } from "./OtpLayout.styles";

// Formats a raw phone number (e.g. +919444444444) into +91 94444 44444 for cleaner display on screen
const formatPhoneNumber = (rawPhone: string) => {
  if (!rawPhone) return "";
  const cleaned = rawPhone.replace(/\s+/g, "");
  // Format only standard Indian phone numbers (+91 followed by 10 digits)
  if (cleaned.startsWith("+91") && cleaned.length === 13) {
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
    slots,
    inputValue,
    otpError,
    error,
    resendCooldown,
    isButtonLoading,
    isValid,
    inputRef,
    activeIndex,
    handleBoxPress,
    handleResend,
    handleOtpChange,
    handleVerify,
  } = useOtp();

  return (
    // Skip is left to AuthScreenShell's default — it already replaces to /(tabs).
    <AuthScreenShell
      footer={
        <View>
          <View className="items-start" style={s.headerContainer}>
            <Text style={s.title}>Verify OTP</Text>
            <View style={s.phoneRow}>
              <Text style={s.phone}>{formatPhoneNumber(phone || "")}</Text>
              <Touchable
                onPress={() => router.back()}
                style={s.editBtnUnderline}
                accessibilityRole="button"
                accessibilityLabel="Edit phone number"
              >
                <Text style={s.editBtn}>Edit</Text>
              </Touchable>
            </View>
          </View>

          <OtpForm
            slots={slots}
            inputValue={inputValue}
            otpError={otpError}
            error={error}
            loading={isButtonLoading}
            resendCooldown={resendCooldown}
            activeIndex={activeIndex}
            onBoxPress={handleBoxPress}
            onOtpChange={handleOtpChange}
            onResend={handleResend}
            inputRef={inputRef}
          />

          <Touchable
            activeOpacity={0.8}
            onPress={() => handleVerify()}
            disabled={isButtonLoading || !isValid}
            accessibilityRole="button"
            accessibilityLabel="Verify and continue"
            accessibilityState={{
              disabled: isButtonLoading || !isValid,
              busy: isButtonLoading,
            }}
            style={[
              formStyles.btn,
              isButtonLoading || !isValid
                ? formStyles.btnDisabled
                : formStyles.btnEnabled,
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
