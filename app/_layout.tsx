import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { focusManager, QueryClientProvider } from "@tanstack/react-query";
import * as NavigationBar from "expo-navigation-bar";
import { Stack, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus, Platform, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../src/utils/logBoxIgnore";
import "../src/utils/patchText";
import "../src/utils/patchTextInput";

import { apiClient, setUnauthorizedHandler } from "@/src/api/client";
import { AppGateScreen } from "@/src/components/common/AppGateScreen";
import { ErrorBoundary } from "@/src/components/common/ErrorBoundary";
import { GlobalAlertDialog } from "@/src/components/common/GlobalAlertDialog";
import NetworkToast from "@/src/components/common/NetworkToast";
import { SoftUpdateModal } from "@/src/components/common/SoftUpdateModal";
import { Toast } from "@/src/components/common/Toast";
import { UpdateReadyBanner } from "@/src/components/common/UpdateReadyBanner";
import DevPreviewToggler from "@/src/components/dev/DevPreviewToggler";
import { SplashAnimationScreen } from "@/src/components/splash/SplashAnimationScreen";
import { SignupBonusPopup } from "@/src/features/auth/components/SignupBonusPopup";
import { useAppGate } from "@/src/hooks/system/useAppGate";
import { useInAppUpdate } from "@/src/hooks/system/useInAppUpdate";
import { useOtaUpdate } from "@/src/hooks/system/useOtaUpdate";
import { usePushNotifications } from "@/src/hooks/system/usePushNotifications";
import { useSoftUpdate } from "@/src/hooks/system/useSoftUpdate";
import { useCartSocketSync } from "@/src/features/cart/hooks/useCartSocketSync";
import { queryClient } from "@/src/lib/react-query/queryClient";
import { initDb } from "@/src/lib/sqlite/db";
import {
  analyticsService,
  initCrashReporting,
  PERF_TRACES,
  usePerformanceTrace,
} from "@/src/services/firebase";
import { useAuthStore } from "@/src/store/authStore";
import { useUIStore } from "@/src/store/uiStore";
import { screenTransitions } from "@/src/theme";
import { initNetworkListener } from "@/src/utils/network";
import { requestQueue } from "@/src/utils/requestQueue";
import "../global.css";

/** Expo Router setting to ensure a cold-started deep link has the home route in its navigation stack history. */
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

// Wrapped component to run queries within QueryClientProvider
const AppGate = () => {
  const { reason, maintenanceMessage } = useAppGate();
  const soft = useSoftUpdate();
  const update = useInAppUpdate();
  const ota = useOtaUpdate();
  // Prevent double analytics logging on update events
  const acceptedRef = useRef(false);
  // Toggle button label to Retry on update failure
  const [immediateFailed, setImmediateFailed] = useState(false);

  // Log block state transitions exactly once
  useEffect(() => {
    if (reason) analyticsService.logAppBlocked(reason);
  }, [reason]);

  useEffect(() => {
    if (soft.shouldPrompt) analyticsService.logSoftUpdatePrompt("shown");
  }, [soft.shouldPrompt]);

  // Request immediate Play Store update when blocked
  useEffect(() => {
    if (reason !== "update" || !update.isSupported) return;
    update.runImmediateUpdate().then((ok) => setImmediateFailed(!ok));
  }, [reason, update.isSupported]); // eslint-disable-line react-hooks/exhaustive-deps

  // Priority: block screens overlay soft updates
  if (reason) {
    return (
      <AppGateScreen
        reason={reason}
        maintenanceMessage={maintenanceMessage}
        onUpdatePress={
          update.isSupported
            ? () => {
                update
                  .runImmediateUpdate()
                  .then((ok) => setImmediateFailed(!ok));
              }
            : undefined
        }
        updateLabel={immediateFailed ? "Retry" : undefined}
      />
    );
  }

  return (
    <>
      <SoftUpdateModal
        visible={soft.shouldPrompt}
        latestVersion={soft.latestVersion}
        onDismiss={() => {
          if (!acceptedRef.current) {
            analyticsService.logSoftUpdatePrompt("dismissed");
          }
          acceptedRef.current = false;
          soft.dismiss();
        }}
        onUpdate={() => {
          acceptedRef.current = true;
          analyticsService.logSoftUpdatePrompt("accepted");
          // Start flexible background update
          update.runFlexibleUpdate();
        }}
      />
      {/* Update ready banner for Play Store or OTA updates */}
      <UpdateReadyBanner
        visible={update.isDownloaded || ota.isDownloaded}
        onRestart={
          update.isDownloaded ? update.restartAndInstall : ota.restartAndInstall
        }
      />
    </>
  );
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

  // Auth load and splash animation run in parallel; app reveals when both finish
  const [isAnimationDone, setIsAnimationDone] = useState(false);

  useEffect(() => {
    initialize();
  }, []);

  // Track custom mapped screen names to prevent sending sensitive route params to analytics
  useEffect(() => {
    analyticsService.logScreenView(screenNameForPath(pathname));
  }, [pathname]);

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
      requestQueue.clear();
      useAuthStore.getState().logout();
    });
  }, []);

  // Hide native splash immediately; JS splash takes over
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  // Render app tree underneath the splash curtain to avoid white mount flashes
  const showSplash = !isAnimationDone || !isAuthLoaded;

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
                      isAppReady={isAuthLoaded}
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
