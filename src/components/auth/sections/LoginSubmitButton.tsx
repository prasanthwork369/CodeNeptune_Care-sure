import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { LoginSubmitButtonProps } from "@/src/types/auth";
import React from "react";
import { ActivityIndicator, Text } from "react-native";
import { styles as s } from "./LoginForm.styles";

export const LoginSubmitButton: React.FC<LoginSubmitButtonProps> = ({
  loading,
  onGetOtp,
  isValid,
}) => {
  const disabled = loading || !isValid;

  return (
    <Touchable
      testID="get-otp-btn"
      activeOpacity={0.8}
      onPress={onGetOtp}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel="Get OTP"
      accessibilityState={{ disabled, busy: loading }}
      style={[s.btn, disabled ? s.btnDisabled : s.btnEnabled]}
    >
      {loading ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <>
          <Text style={s.btnText}>Get OTP</Text>
          <icons.arrow_forward_white width={13} height={13} fill="#ffffff" />
        </>
      )}
    </Touchable>
  );
};
