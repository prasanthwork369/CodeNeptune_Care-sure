import { applyDigitsOnlyFilter } from "@/src/modules/TextInputFilter";
import { LoginFormProps } from "@/src/types/auth";
import { sanitize } from "@/src/utils/validation";
import React, { useState } from "react";
import { Text, TextInput, View } from "react-native";
import { styles as s } from "./LoginForm.styles";

export const LoginForm: React.FC<LoginFormProps> = ({
  phoneNumber,
  phoneError,
  error,
  onPhoneChange,
  onPhoneFocus,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  // Strip everything but digits on each keystroke.
  const handleText = (text: string) => onPhoneChange(sanitize.phone(text));

  return (
    <View>
      <View
        style={[
          s.inputWrap,
          {
            borderColor: phoneError
              ? "#EF4444"
              : isFocused
                ? "#0F7635"
                : "#919EAB33",
          },
        ]}
      >
        <Text style={s.prefix}>+91</Text>
        <View style={s.divider} />
        <TextInput
          ref={applyDigitsOnlyFilter}
          testID="phone-input"
          allowFontScaling={false}
          placeholder="Enter your mobile number"
          placeholderTextColor="#6A6A6A"
          // MUST stay "number-pad" (maps to Android inputType="number") — a clean
          // 0-9 pad. Do NOT use "phone-pad": it renders the full dialer with
          // symbol keys (, . * Pause Wait N) that QA flagged as enterable at the
          // keyboard UI layer.
          keyboardType="number-pad"
          textContentType="telephoneNumber"
          autoComplete="tel"
          accessibilityLabel="Mobile number"
          style={s.input}
          // No maxLength: it truncates a pasted "+91…" before sanitize.phone can
          // strip the country code, silently producing a wrong number.
          cursorColor="#0F7635"
          value={phoneNumber}
          onChangeText={handleText}
          // onPhoneFocus triggers the native Android SIM selector hint prompt to pick phone number automatically
          onFocus={() => {
            setIsFocused(true);
            onPhoneFocus?.();
          }}
          onBlur={() => setIsFocused(false)}
        />
      </View>

      {phoneError || error ? (
        <Text style={s.error}>{phoneError || error}</Text>
      ) : null}
    </View>
  );
};
