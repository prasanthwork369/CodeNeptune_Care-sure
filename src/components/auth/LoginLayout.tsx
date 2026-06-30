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
    router,
    phoneNumber,
    phoneError,
    loading,
    error,
    isValid,
    handleChangeText,
    handlePhoneFocus,
    handleGetOtp,
  } = useLogin();

  return (
    <AuthScreenShell
      onSkip={() => router.replace("/(tabs)")}
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
            onPhoneFocus={handlePhoneFocus}
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
