import { LoginFormProps } from "@/src/types/auth";
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
          placeholder="Enter your mobile number"
          placeholderTextColor="#6A6A6A"
          keyboardType="phone-pad"
          textContentType="telephoneNumber"
          autoComplete="tel"
          accessibilityLabel="Mobile number"
          style={s.input}
          maxLength={10}
          cursorColor="#0F7635"
          value={phoneNumber}
          onChangeText={onPhoneChange}
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
