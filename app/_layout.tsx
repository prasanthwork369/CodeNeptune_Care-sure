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

// Its own component so the settings query runs inside QueryClientProvider —
// RootLayout renders that provider, so a hook there would sit outside it.
const AppGate = () => {
  const { reason, maintenanceMessage } = useAppGate();
  const soft = useSoftUpdate();
  const update = useInAppUpdate();
  // JS-only fixes via EAS Update — a separate lane from the native Play
  // flow above, for changes that don't need a new binary at all.
  const ota = useOtaUpdate();
  // Update calls onUpdate then onDismiss; this stops that pair being counted
  // as a decline as well as an acceptance.
  const acceptedRef = useRef(false);
  // Only after a Play attempt has failed does the button become a retry.
  const [immediateFailed, setImmediateFailed] = useState(false);

  // Reported once per transition, not per render, so the counts stay truthful.
  useEffect(() => {
    if (reason) analyticsService.logAppBlocked(reason);
  }, [reason]);

  useEffect(() => {
    if (soft.shouldPrompt) analyticsService.logSoftUpdatePrompt("shown");
  }, [soft.shouldPrompt]);

  // Forced path: ask Play for an immediate update as soon as the block appears.
  // Guarded inside the hook, so a re-render cannot relaunch the dialog.
  useEffect(() => {
    if (reason !== "update" || !update.isSupported) return;
    update.runImmediateUpdate().then((ok) => setImmediateFailed(!ok));
  }, [reason, update.isSupported]); // eslint-disable-line react-hooks/exhaustive-deps

  // A block always wins: the optional prompt must never sit on top of a screen
  // telling the user the app cannot run.
  if (reason) {
    return (
      <AppGateScreen
        reason={reason}
        maintenanceMessage={maintenanceMessage}
        // Play's own UI covers this screen when the flow starts; this stays as
        // the fallback for when it cannot, and becomes Retry once it has failed.
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
        // Fires for Later and Android back; Update reports itself below first.
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
          // Flexible downloads in the background; the app stays usable.
          update.runFlexibleUpdate();
        }}
      />
      {/* Shared banner for whichever lane has something ready — native Play
          update takes priority in the unlikely case both land at once. */}
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
      NavigationBar.setStyle("dark");
    }
  }, []);

  useEffect(() => {
    const unsubscribe = initNetworkListener(apiClient);
    return () => unsubscribe();
  }, []);

  // Bridges RN's AppState to React Query's focusManager, so queries that opt
  // into refetchOnWindowFocus refresh when the app returns from background.
  // The global default stays refetchOnWindowFocus: false, so this alone
  // changes nothing until a query explicitly opts in.
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

  // Hide native splash immediately so our animated JS splash takes over —
  // Android's Inter fonts are natively embedded (see app.config.ts), so
  // nothing here waits on a runtime font load anymore.
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  // Splash acts as a curtain over the fully-mounted app tree.
  // The app renders and initialises underneath while the splash plays —
  // so when the curtain lifts the home screen is already ready, no white flash.
  const showSplash = !isAnimationDone || !isAuthLoaded;

  usePerformanceTrace({
    traceName: PERF_TRACES.APP_LAUNCH,
    isLoading: showSplash,
  });

  // Prompting under the curtain gets auto-denied with no dialog on some ROMs.
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
                {/* Edge-to-edge is mandatory as of SDK 55+, so the status bar is
                    always translucent — translucent/backgroundColor props were
                    removed from expo-status-bar's API. */}
                <StatusBar style="dark" />

                {/* Android's Inter fonts are natively embedded (app.config.ts), so
                    the tree mounts immediately — no runtime font-load gate. */}
                <BottomSheetModalProvider>
                  <Stack
                    screenOptions={{
                      headerShown: false,
                      ...screenTransitions.nativePush,
                    }}
                  >
                    <Stack.Screen name="index" options={screenTransitions.fade} />
                    {/* Every auth guard redirects here, so entering it must not read as a push */}
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

                {/* Splash curtain over the app tree; the tree still mounts and lays out beneath it, so there is no white flash. */}
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

                {/* Last sibling so it paints above the splash too — a blocked app
                    must never flash its content. Fail-open: an absent setting renders nothing. */}
                <AppGate />
              </View>
            </SafeAreaProvider>
          </KeyboardProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
