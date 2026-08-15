import { applyDigitsOnlyFilter } from "@/src/modules/TextInputFilter";
import { colors } from "@/src/theme";
import React, { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { LoginFormProps } from "../types";
import { styles as s } from "./LoginForm.styles";

const MAX_PHONE_DIGITS = 10;

export const LoginForm: React.FC<LoginFormProps> = ({
  phoneNumber,
  phoneError,
  error,
  onPhoneChange,
  inputRef,
  hintShieldVisible,
  onHintPress,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  // Stable, or the native filter re-applies on every keystroke.
  const setInputRef = useCallback(
    (r: TextInput | null) => {
      applyDigitsOnlyFilter(r, MAX_PHONE_DIGITS);
      if (inputRef) inputRef.current = r;
    },
    [inputRef],
  );

  const borderStyle = phoneError
    ? s.inputWrapError
    : isFocused
      ? s.inputWrapFocused
      : s.inputWrapIdle;

  return (
    <View>
      <View style={[s.inputWrap, borderStyle]}>
        <Text style={s.prefix}>+91</Text>
        <View style={s.divider} />
        <TextInput
          // Native filter caps typed input at 10 so the 11th digit never flashes.
          ref={setInputRef}
          testID="phone-input"
          allowFontScaling={false}
          placeholder="Enter your mobile number"
          placeholderTextColor={colors.subtext}
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
          cursorColor={colors.primary}
          value={phoneNumber}
          // Forward raw text — useLogin owns sanitization and overflow rejection.
          onChangeText={onPhoneChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {/* Spends the first tap on the hint so the field never focuses. */}
        {hintShieldVisible ? (
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={onHintPress}
            accessibilityRole="button"
            accessibilityLabel="Mobile number"
          />
        ) : null}
      </View>

      {phoneError || error ? (
        <Text testID="phone-error" style={s.error}>
          {phoneError || error}
        </Text>
      ) : null}
    </View>
  );
};
