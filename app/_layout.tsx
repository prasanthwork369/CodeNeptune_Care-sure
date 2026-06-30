import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { QueryClientProvider } from "@tanstack/react-query";
import * as NavigationBar from "expo-navigation-bar";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Image, Platform, View, TouchableOpacity, Text } from "react-native";
import "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../src/utils/logBoxIgnore";
import "../src/utils/patchText";
import "../src/utils/patchTextInput";

import { apiClient, setUnauthorizedHandler } from "@/src/api/client";
import { SignupBonusPopup } from "@/src/components/auth/SignupBonusPopup";
import NetworkToast from "@/src/components/common/NetworkToast";
import { Toast } from "@/src/components/common/Toast";
import { DevTestButton } from "@/src/components/dev/DevTestButton";
import { usePushNotifications } from "@/src/hooks/ui/usePushNotifications";
import { useAndroidInterFonts } from "@/src/hooks/useAndroidInterFonts";
import { useCartSocketSync } from "@/src/hooks/useCartSocketSync";
import { queryClient } from "@/src/lib/react-query/queryClient";
import { initDb } from "@/src/lib/sqlite/db";
import { useAuthStore } from "@/src/store/authStore";
import { initNetworkListener } from "@/src/utils/network";
import { requestQueue } from "@/src/utils/requestQueue";
import "../global.css";

initDb();

const CartSyncProvider = () => {
  useCartSocketSync();
  return null;
};

const PushNotificationProvider = () => {
  usePushNotifications();
  return null;
};

const SPLASH_LOGO = require("../assets/images/splash-icon.png");

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const isAuthLoaded = useAuthStore((s) => s.isLoaded);
  const initialize = useAuthStore((s) => s.initialize);

  const interFontsLoaded = useAndroidInterFonts();

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setButtonStyleAsync("dark").catch(() => {});
    }
  }, []);

  useEffect(() => {
    const unsubscribe = initNetworkListener(apiClient);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      queryClient.clear();
      requestQueue.clear();
      useAuthStore.getState().logout();
    });
  }, []);

  useEffect(() => {
    if (isAuthLoaded && interFontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [isAuthLoaded, interFontsLoaded]);

  if (!isAuthLoaded || !interFontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#FFFFFF",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Image
          source={SPLASH_LOGO}
          style={{ width: 200, height: 200 }}
          resizeMode="contain"
        />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardProvider>
          <SafeAreaProvider>
            <View style={{ flex: 1, backgroundColor: "#fff" }}>
              <BottomSheetModalProvider>
                <StatusBar
                  style="dark"
                  translucent
                  backgroundColor="transparent"
                />
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="index" />
                  <Stack.Screen name="(auth)" />
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen name="(modal)" />
                  <Stack.Screen name="(prescription)" />
                  <Stack.Screen
                    name="search"
                    options={{ animation: "fade", animationDuration: 180 }}
                  />
                  <Stack.Screen name="frequent-orders" />
                  <Stack.Screen name="notifications" />
                  <Stack.Screen name="profile" />
                  <Stack.Screen
                    name="product"
                    options={{
                      presentation: "transparentModal",
                      animation: "none",
                      gestureEnabled: false,
                    }}
                  />
                </Stack>
                <CartSyncProvider />
                <PushNotificationProvider />
              </BottomSheetModalProvider>
              {/* Rendered after BottomSheetModalProvider closes (not inside it),
                so these always paint above any open bottom sheet's portal —
                otherwise a sheet's native overlay covers them. */}
              <NetworkToast />
              <Toast />
              <SignupBonusPopup />
              <DevTestButton />
            </View>
          </SafeAreaProvider>
        </KeyboardProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
