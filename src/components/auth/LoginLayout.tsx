import { useLogin } from "@/src/hooks/useLogin";
import { useAuthStore } from "@/src/store/authStore";
import { useFocusEffect } from "expo-router";
import React, { useCallback } from "react";
import { BackHandler, Text, View } from "react-native";
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

  // Expo Router's initial-deep-link anchor (unstable_settings in
  // app/_layout.tsx) seeds a real Home route beneath this screen on every
  // cold, unauthenticated launch — so the default hardware-back pop would
  // silently drop the user into Home without ever going through the
  // explicit Skip button. Exit the app instead, unless the user already
  // opted into guest browsing (isGuest): that means Login was reached from
  // a real in-app screen (e.g. guest checkout), where back should return there.
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          if (useAuthStore.getState().isGuest) return false;
          BackHandler.exitApp();
          return true;
        },
      );
      return () => subscription.remove();
    }, []),
  );

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
