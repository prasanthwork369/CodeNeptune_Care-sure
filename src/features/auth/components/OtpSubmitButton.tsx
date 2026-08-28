import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import React from "react";
import { ActivityIndicator, Text } from "react-native";
import { OtpSubmitButtonProps } from "../types";
import { styles as s } from "./OtpForm.styles";

export const OtpSubmitButton: React.FC<OtpSubmitButtonProps> = ({
  loading,
  isValid,
  onVerify,
}) => {
  const disabled = loading || !isValid;

  return (
    <Touchable
      activeOpacity={0.8}
      onPress={onVerify}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel="Verify and continue"
      accessibilityState={{
        disabled,
        busy: loading,
      }}
      style={[s.btn, disabled ? s.btnDisabled : s.btnEnabled]}
    >
      {loading ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <>
          <Text style={s.btnText}>Verify & Continue</Text>
          <icons.arrow_forward_white width={13} height={13} fill="#ffffff" />
        </>
      )}
    </Touchable>
  );
};
