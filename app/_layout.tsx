import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { focusManager, QueryClientProvider } from "@tanstack/react-query";
import * as NavigationBar from "expo-navigation-bar";
import { Stack, usePathname, useGlobalSearchParams } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { AppState, AppStateStatus, Platform, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../src/utils/logBoxIgnore";
import "../src/utils/patchText";
import "../src/utils/patchTextInput";

import { apiClient, setUnauthorizedHandler } from "@/src/api/client";
import { ErrorBoundary } from "@/src/components/common/ErrorBoundary";
import { GlobalAlertDialog } from "@/src/components/common/GlobalAlertDialog";
import NetworkToast from "@/src/components/common/NetworkToast";
import { Toast } from "@/src/components/common/Toast";
import DevPreviewToggler from "@/src/components/dev/DevPreviewToggler";
import { SplashAnimationScreen } from "@/src/components/splash/SplashAnimationScreen";
import { AppGate } from "@/src/components/system/AppGate";
import { CartSyncProvider } from "@/src/components/system/CartSyncProvider";
import { PushNotificationProvider } from "@/src/components/system/PushNotificationProvider";
import { SignupBonusPopup } from "@/src/features/auth/components/SignupBonusPopup";
import { queryClient } from "@/src/lib/react-query/queryClient";
import { initDb } from "@/src/lib/sqlite/db";
import {
  analyticsService,
  initCrashReporting,
  PERF_TRACES,
  usePerformanceTrace,
} from "@/src/services/firebase";
import { useAuthStore } from "@/src/store/authStore";
import { isSafeRoute, useLastRouteStore } from "@/src/store/lastRouteStore";
import { useUIStore } from "@/src/store/uiStore";
import { screenTransitions } from "@/src/theme";
import { initNetworkListener } from "@/src/utils/network";
import { getScreenNameForPath } from "@/src/utils/screenNameForPath";
import { useNetworkStore } from "@/src/store/useNetworkStore";
import "../global.css";

/** Expo Router setting to ensure a cold-started deep link has the home route in its navigation stack history. */
export const unstable_settings = {
  initialRouteName: "(tabs)",
};

initDb();
initCrashReporting();

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const pathname = usePathname();
  const searchParams = useGlobalSearchParams();
  const isAuthLoaded = useAuthStore((s) => s.isLoaded);
  const initialize = useAuthStore((s) => s.initialize);

  // Auth load and splash animation run in parallel; app reveals when both finish
  const [isAnimationDone, setIsAnimationDone] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Track custom mapped screen names to prevent sending sensitive route params to analytics
  useEffect(() => {
    analyticsService.logScreenView(getScreenNameForPath(pathname));
  }, [pathname]);

  // Remember the last safe screen so a process recreation (e.g. the user
  // backgrounded the app to flip a permission in Settings) can restore it
  // instead of always landing on Home — see app/index.tsx. Gated on
  // isAuthLoaded so early splash-time pathnames are never captured.
  useEffect(() => {
    if (!isAuthLoaded || !pathname || !isSafeRoute(pathname)) return;
    const params: Record<string, string> = {};
    for (const [key, value] of Object.entries(searchParams)) {
      if (typeof value === "string") params[key] = value;
      else if (Array.isArray(value)) params[key] = value[0] ?? "";
    }
    useLastRouteStore.getState().setRoute(pathname, params);
  }, [pathname, searchParams, isAuthLoaded]);

  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setStyle("dark");
    }
  }, []);

  useEffect(() => {
    const unsubscribe = initNetworkListener(apiClient);
    return () => unsubscribe();
  }, []);

  // Bridge AppState to React Query focus manager for optional focus refetching
  useEffect(() => {
    const onAppStateChange = (status: AppStateStatus) => {
      focusManager.setFocused(status === "active");
    };
    const subscription = AppState.addEventListener("change", onAppStateChange);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      queryClient.clear();
      // useAuthStore.logout() owns clearing the offline request queue, so
      // both this forced path and manual logout stay in sync.
      useAuthStore.getState().logout();
    });
  }, []);

  // Hide native splash immediately; JS splash takes over
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  const isNetworkInitialized = useNetworkStore((s) => s.isInitialized);

  // Render app tree underneath the splash curtain to avoid white mount flashes
  const showSplash =
    !isAnimationDone || !isAuthLoaded || !isNetworkInitialized;

  usePerformanceTrace({
    traceName: PERF_TRACES.APP_LAUNCH,
    isLoading: showSplash,
  });

  // Prevent permission dialog bugs under the splash curtain
  useEffect(() => {
    if (!showSplash) useUIStore.getState().setAppRevealed(true);
  }, [showSplash]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <KeyboardProvider>
            <SafeAreaProvider>
              <View style={{ flex: 1, backgroundColor: "#fff" }}>
                <StatusBar style="dark" />

                <BottomSheetModalProvider>
                  <Stack
                    screenOptions={{
                      headerShown: false,
                      ...screenTransitions.nativePush,
                    }}
                  >
                    <Stack.Screen name="index" options={screenTransitions.fade} />
                    {/* Auth stack has no push animation to prevent loops */}
                    <Stack.Screen
                      name="(auth)"
                      options={screenTransitions.none}
                    />
                    <Stack.Screen
                      name="(tabs)"
                      options={screenTransitions.authComplete}
                    />
                    <Stack.Screen name="(commerce)" />
                    <Stack.Screen name="(catalog)" />
                    <Stack.Screen name="(prescription)" />
                    <Stack.Screen name="search" />
                    <Stack.Screen name="notifications" />
                    <Stack.Screen name="profile" />
                    <Stack.Screen name="product" />
                    <Stack.Screen
                      name="+not-found"
                      options={screenTransitions.result}
                    />
                  </Stack>
                  <CartSyncProvider />
                  <PushNotificationProvider />
                </BottomSheetModalProvider>
                <NetworkToast />
                <Toast />
                <GlobalAlertDialog />
                <SignupBonusPopup />

                {__DEV__ && <DevPreviewToggler />}

                {showSplash && (
                  <View
                    style={StyleSheet.absoluteFill}
                    pointerEvents="box-only"
                  >
                    <SplashAnimationScreen
                      isAppReady={isAuthLoaded && isNetworkInitialized}
                      onComplete={() => setIsAnimationDone(true)}
                    />
                  </View>
                )}

                {/* Render gate modal above all screens */}
                <AppGate />
              </View>
            </SafeAreaProvider>
          </KeyboardProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
