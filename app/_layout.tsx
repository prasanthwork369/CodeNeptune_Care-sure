import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { QueryClientProvider } from "@tanstack/react-query";
import * as NavigationBar from "expo-navigation-bar";
import { Stack, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../src/utils/logBoxIgnore";
import "../src/utils/patchText";
import "../src/utils/patchTextInput";

import { apiClient, setUnauthorizedHandler } from "@/src/api/client";
import { SignupBonusPopup } from "@/src/components/auth/SignupBonusPopup";
import { ErrorBoundary } from "@/src/components/common/ErrorBoundary";
import NetworkToast from "@/src/components/common/NetworkToast";
import { Toast } from "@/src/components/common/Toast";
import { GlobalAlertDialog } from "@/src/components/common/GlobalAlertDialog";
import { SplashAnimationScreen } from "@/src/components/splash/SplashAnimationScreen";
import { usePushNotifications } from "@/src/hooks/ui/usePushNotifications";
import { useAndroidInterFonts } from "@/src/hooks/useAndroidInterFonts";
import { useCartSocketSync } from "@/src/hooks/useCartSocketSync";
import { analyticsService, initCrashReporting } from "@/src/services/firebase";
import { queryClient } from "@/src/lib/react-query/queryClient";
import { initDb } from "@/src/lib/sqlite/db";
import { useAuthStore } from "@/src/store/authStore";
import { screenTransitions } from "@/src/theme";
import { initNetworkListener } from "@/src/utils/network";
import { requestQueue } from "@/src/utils/requestQueue";
import { PERF_TRACES, usePerformanceTrace } from "@/src/services/firebase";
import "../global.css";

/**
 * Expo Router uses this anchor only when it builds a navigation state from an
 * initial deep link. This gives every cold-start destination a real Home route
 * beneath it, while normal in-app and warm-start navigation keep their existing
 * history unchanged.
 */
export const unstable_settings = {
  initialRouteName: "(tabs)",
};

initDb();
initCrashReporting();

const CartSyncProvider = () => {
  useCartSocketSync();
  return null;
};

const PushNotificationProvider = () => {
  usePushNotifications();
  return null;
};

SplashScreen.preventAutoHideAsync();

const screenNameForPath = (pathname: string) => {
  if (pathname === "/") return "launch";
  if (pathname.startsWith("/product/")) return "product_details";
  if (pathname.startsWith("/search/product/")) return "product_comparison";
  if (pathname.startsWith("/search")) return "search";
  if (pathname.startsWith("/category/")) return "category_products";
  if (pathname.startsWith("/profile/orders")) return "orders";
  if (pathname.startsWith("/profile")) return "profile";
  if (pathname.startsWith("/notifications")) return "notifications";
  if (pathname.startsWith("/cart")) return "cart";
  if (pathname.startsWith("/payment")) return "checkout";
  if (pathname.startsWith("/upload")) return "prescription_upload";
  if (pathname.startsWith("/login")) return "login";
  if (pathname.startsWith("/otp")) return "otp";
  if (pathname.startsWith("/categories")) return "categories";
  return "other";
};

export default function RootLayout() {
  const pathname = usePathname();
  const isAuthLoaded = useAuthStore((s) => s.isLoaded);
  const initialize = useAuthStore((s) => s.initialize);
  const interFontsLoaded = useAndroidInterFonts();

  // Tracks whether the JS animated splash has finished playing.
  // Auth loading and the animation run in parallel — the app only
  // shows once BOTH are done, whichever takes longer.
  const [isAnimationDone, setIsAnimationDone] = useState(false);

  useEffect(() => {
    initialize();
  }, []);

  // Expo Router keeps a single Android Activity, so native automatic screen
  // reporting cannot distinguish route changes. Track an allow-listed screen
  // name only; never include route params, ids, search terms, or URLs.
  useEffect(() => {
    analyticsService.logScreenView(screenNameForPath(pathname));
  }, [pathname]);

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

  // Hide native splash as soon as fonts are ready so our
  // animated JS splash takes over seamlessly.
  useEffect(() => {
    if (interFontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [interFontsLoaded]);

  // Splash acts as a curtain over the fully-mounted app tree.
  // The app renders and initialises underneath while the splash plays —
  // so when the curtain lifts the home screen is already ready, no white flash.
  const showSplash = !interFontsLoaded || !isAnimationDone || !isAuthLoaded;

  usePerformanceTrace({
    traceName: PERF_TRACES.APP_LAUNCH,
    isLoading: showSplash,
  });

  return (
    <ErrorBoundary>
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
                  <Stack
                    screenOptions={{
                      headerShown: false,
                      ...screenTransitions.push,
                    }}
                  >
                    <Stack.Screen name="index" />
                    <Stack.Screen name="(auth)" />
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="(stack)" />
                    <Stack.Screen name="(prescription)" />
                    <Stack.Screen
                      name="search"
                      options={screenTransitions.fade}
                    />
                    <Stack.Screen name="notifications" />
                    <Stack.Screen name="profile" />
                    <Stack.Screen name="product" />
                  </Stack>
                  <CartSyncProvider />
                  <PushNotificationProvider />
                </BottomSheetModalProvider>
                <NetworkToast />
                <Toast />
                <GlobalAlertDialog />
                <SignupBonusPopup />

                {/* Splash curtain — sits above the entire app tree.
                  Renders the animated splash while fonts/auth/animation
                  are pending, then unmounts cleanly once the app underneath
                  is fully ready. No white flash since app is already mounted. */}
                {showSplash && (
                  <View
                    style={StyleSheet.absoluteFillObject}
                    pointerEvents="box-only"
                  >
                    {interFontsLoaded ? (
                      <SplashAnimationScreen
                        isAppReady={isAuthLoaded}
                        onComplete={() => setIsAnimationDone(true)}
                      />
                    ) : (
                      <View style={styles.splashFallback} />
                    )}
                  </View>
                )}
              </View>
            </SafeAreaProvider>
          </KeyboardProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  splashFallback: {
    flex: 1,
    backgroundColor: "#F4FAF5",
  },
});
