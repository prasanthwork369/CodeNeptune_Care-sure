import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { AUTH_CONFIG } from "@/src/features/auth/constants/auth.constants";
import { applyDigitsOnlyFilter } from "@/src/modules/TextInputFilter";
import { colors } from "@/src/theme";
import React, { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { LoginFormProps } from "../types";
import { styles as s } from "./LoginForm.styles";

export const LoginForm: React.FC<LoginFormProps> = ({
  phoneNumber,
  phoneError,
  error,
  onPhoneChange,
  onSubmitEditing,
  inputRef,
  hintShieldVisible,
  onHintPress,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const setInputRef = useCallback(
    (r: TextInput | null) => {
      applyDigitsOnlyFilter(r, AUTH_CONFIG.PHONE_DIGITS);
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
          ref={setInputRef}
          testID="phone-input"
          allowFontScaling={false}
          placeholder="Enter your mobile number"
          placeholderTextColor={colors.subtext}
          keyboardType="number-pad"
          returnKeyType="done"
          textContentType="telephoneNumber"
          autoComplete="tel"
          accessibilityLabel="Mobile number"
          style={s.input}
          cursorColor={colors.primary}
          value={phoneNumber}
          onChangeText={onPhoneChange}
          onSubmitEditing={onSubmitEditing}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {phoneNumber.length > 0 && (
          <Touchable
            testID="phone-clear-btn"
            onPress={() => onPhoneChange("")}
            accessibilityRole="button"
            accessibilityLabel="Clear mobile number"
          >
            <icons.close_dark width={12} height={12} fill={colors.subtext} />
          </Touchable>
        )}

        {hintShieldVisible ? (
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={onHintPress}
            accessibilityRole="none"
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
