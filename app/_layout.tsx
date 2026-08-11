import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { QueryClientProvider } from "@tanstack/react-query";
import * as NavigationBar from "expo-navigation-bar";
import { Stack, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../src/utils/logBoxIgnore";
import "../src/utils/patchText";
import "../src/utils/patchTextInput";

import { apiClient, setUnauthorizedHandler } from "@/src/api/client";
import { SignupBonusPopup } from "@/src/components/auth/SignupBonusPopup";
import { AppGateScreen } from "@/src/components/common/AppGateScreen";
import { ErrorBoundary } from "@/src/components/common/ErrorBoundary";
import { GlobalAlertDialog } from "@/src/components/common/GlobalAlertDialog";
import NetworkToast from "@/src/components/common/NetworkToast";
import { SoftUpdateModal } from "@/src/components/common/SoftUpdateModal";
import { Toast } from "@/src/components/common/Toast";
import { UpdateReadyBanner } from "@/src/components/common/UpdateReadyBanner";
import DevPreviewToggler from "@/src/components/dev/DevPreviewToggler";
import { SplashAnimationScreen } from "@/src/components/splash/SplashAnimationScreen";
import { useAppGate } from "@/src/hooks/ui/useAppGate";
import { useInAppUpdate } from "@/src/hooks/ui/useInAppUpdate";
import { usePushNotifications } from "@/src/hooks/ui/usePushNotifications";
import { useSoftUpdate } from "@/src/hooks/ui/useSoftUpdate";
import { useAndroidInterFonts } from "@/src/hooks/useAndroidInterFonts";
import { useCartSocketSync } from "@/src/hooks/useCartSocketSync";
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
      <UpdateReadyBanner
        visible={update.isDownloaded}
        onRestart={update.restartAndInstall}
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
                <StatusBar
                  style="dark"
                  translucent
                  backgroundColor="transparent"
                />

                {/* Android measures text with the family registered at that moment and never re-measures once a font loads later, so nothing may mount before Inter is ready. */}
                {interFontsLoaded && (
                  <>
                    <BottomSheetModalProvider>
                      <Stack
                        screenOptions={{
                          headerShown: false,
                          ...screenTransitions.nativePush,
                        }}
                      >
                        <Stack.Screen
                          name="index"
                          options={screenTransitions.fade}
                        />
                        {/* Every auth guard redirects here, so entering it must not read as a push */}
                        <Stack.Screen
                          name="(auth)"
                          options={screenTransitions.none}
                        />
                        <Stack.Screen
                          name="(tabs)"
                          options={screenTransitions.authComplete}
                        />
                        <Stack.Screen name="(stack)" />
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
                  </>
                )}

                {__DEV__ && <DevPreviewToggler />}

                {/* Splash curtain over the app tree; the tree still mounts and lays out beneath it once fonts are ready, so there is no white flash. */}
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

const styles = StyleSheet.create({
  splashFallback: {
    flex: 1,
    backgroundColor: "#F4FAF5",
  },
});
