import { NoInternetState } from "@/src/components/ui/NoInternetState";
import { Touchable } from "@/src/components/ui/Touchable";
import { useIsOffline } from "@/src/hooks/ui/useIsOffline";
import React from "react";
import { Text, View } from "react-native";
import { AuthFooter } from "../components/AuthFooter";
import { AuthScreenShell } from "../components/AuthScreenShell";
import { OtpForm } from "../components/OtpForm";
import { OtpSubmitButton } from "../components/OtpSubmitButton";
import { useOtp } from "../hooks/useOtp";
import { styles as s } from "./OtpLayout.styles";

const formatPhoneNumber = (rawPhone: string) => {
  if (!rawPhone) return "";
  const cleaned = rawPhone.replace(/\s+/g, "");
  if (cleaned.startsWith("+91") && cleaned.length === 13) {
    return `+91 ${cleaned.slice(3, 8)} ${cleaned.slice(8)}`;
  }
  return rawPhone;
};

/**
 * Presentation component for the OTP Verification screen.
 */
export const OtpLayout: React.FC = () => {
  const isOffline = useIsOffline();
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

  if (isOffline) {
    return (
      <View className="flex-1 bg-white">
        <NoInternetState onRetry={() => {}} />
      </View>
    );
  }

  return (
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
            onSubmitEditing={() => handleVerify()}
            inputRef={inputRef}
          />

          <OtpSubmitButton
            loading={isButtonLoading}
            isValid={isValid}
            onVerify={() => handleVerify()}
          />

          <AuthFooter />
        </View>
      }
    />
  );
};
