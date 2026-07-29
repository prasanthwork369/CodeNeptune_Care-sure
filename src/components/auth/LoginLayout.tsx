import { useLogin } from "@/src/hooks/useLogin";
import React from "react";
import { Text, View } from "react-native";
import { styles as s } from "./LoginLayout.styles";
import { AuthFooter } from "./sections/AuthFooter";
import { AuthScreenShell } from "./sections/AuthScreenShell";
import { LoginForm } from "./sections/LoginForm";
import { LoginSubmitButton } from "./sections/LoginSubmitButton";

/**
 * Presentation component for the Login screen.
 * Delegates all state, side effects, validation, and mutations to the `useLogin` hook.
 */
export const LoginLayout: React.FC = () => {
  const {
    phoneNumber,
    phoneError,
    loading,
    error,
    isValid,
    phoneInputRef,
    hintShieldVisible,
    handleChangeText,
    handleHintPress,
    handleGetOtp,
  } = useLogin();

  return (
    // Skip is left to AuthScreenShell's default — it already replaces to /(tabs).
    <AuthScreenShell
      footer={
        <>
          <View className="items-center" style={s.headerContainer}>
            <Text
              style={s.title}
              className="font-inter-extrabold text-brand-text text-center"
            >
              Why pay more for the same medicine?
            </Text>
          </View>
          <LoginForm
            phoneNumber={phoneNumber}
            phoneError={phoneError}
            error={error}
            onPhoneChange={handleChangeText}
            inputRef={phoneInputRef}
            hintShieldVisible={hintShieldVisible}
            onHintPress={handleHintPress}
          />
          <LoginSubmitButton
            loading={loading}
            onGetOtp={handleGetOtp}
            isValid={isValid}
          />
          <AuthFooter />
        </>
      }
    />
  );
};
