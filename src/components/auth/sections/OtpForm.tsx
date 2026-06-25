import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { OtpFormProps } from "@/src/types/auth";
import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { styles as s } from "./OtpForm.styles";

export const OtpForm: React.FC<OtpFormProps> = ({
  otp,
  otpError,
  error,
  loading,
  resendCooldown,
  onOtpChange,
  onKeyPress,
  onResend,
  inputRefs,
}) => {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  return (
    <View>
      <View className="flex-row justify-between px-1" style={s.boxRow}>
        {otp.map((digit, index) => (
          <Pressable
            key={index}
            onPress={() => inputRefs.current[index]?.focus()}
            className="w-[14%] aspect-square rounded-lg bg-white items-center justify-center"
            style={{
              borderWidth: focusedIndex === index ? 1.5 : 1.5,
              borderColor: otpError || error ? "#EF4444" : focusedIndex === index ? "#0F7635" : "#919EAB22",
            }}
          >
            <TextInput
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              value={digit}
              onChangeText={(value) => onOtpChange(value, index)}
              onKeyPress={(e) => onKeyPress(e, index)}
              onFocus={() => setFocusedIndex(index)}
              onBlur={() => setFocusedIndex((cur) => (cur === index ? null : cur))}
              keyboardType="number-pad"
              // iOS/Android SMS autofill works by pasting the complete 6-digit OTP code into the
              // very first input field. By setting maxLength=6 on the first field and enabling
              // oneTimeCode/sms-otp, we allow the OS to auto-paste the full code. handleOtpChange
              // then splits this 6-digit string across all input boxes.
              maxLength={index === 0 ? 6 : 1}
              textContentType={index === 0 ? "oneTimeCode" : "none"}
              autoComplete={index === 0 ? "sms-otp" : "off"}
              accessibilityLabel={`OTP digit ${index + 1}`}
              selectTextOnFocus={false}
              contextMenuHidden
              caretHidden={true}
              autoCorrect={false}
              spellCheck={false}
              cursorColor="#0F7635"
              style={s.otpInput}
            />
          </Pressable>
        ))}
      </View>

      {otpError || error ? (
        <Text style={s.error}>{otpError || error}</Text>
      ) : null}

      <View className="flex-row items-center justify-center mb-1">
        {resendCooldown > 0 ? (
          <Text style={s.resendText}>
            Resend OTP in{" "}
            <Text style={s.resendHighlight}>{resendCooldown}s</Text>
          </Text>
        ) : (
          <Touchable
            onPress={onResend}
            disabled={loading}
            activeOpacity={0.7}
            hitSlop={{ top: 16, bottom: 16, left: 24, right: 24 }}
            className="py-2 px-4"
          >
            <Text style={s.resendBtn}>Resend OTP</Text>
          </Touchable>
        )}
      </View>
    </View>
  );
};
