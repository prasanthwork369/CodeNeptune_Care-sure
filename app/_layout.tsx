import {
  Inter_100Thin,
  Inter_200ExtraLight,
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  Inter_900Black,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClientProvider } from "@tanstack/react-query";
import * as NavigationBar from 'expo-navigation-bar';
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Image, LogBox, Platform, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

LogBox.ignoreLogs([
  'Cannot record touch end without a touch start',
  '`setPositionAsync` is not supported with edge-to-edge enabled.',
  '`setBackgroundColorAsync` is not supported with edge-to-edge enabled.',
  'Looks like you have configured linking in multiple places.',
]);

import { apiClient, setUnauthorizedHandler } from "@/src/api/client";
import { queryClient } from "@/src/lib/react-query/queryClient";
import { useAuthStore } from "@/src/store/authStore";
import NetworkToast from "@/src/components/common/NetworkToast";
import { initNetworkListener } from "@/src/utils/network";
import { requestQueue } from "@/src/utils/requestQueue";
import { useCartSocketSync } from "@/src/hooks/useCartSocketSync";
import { usePushNotifications } from "@/src/hooks/ui/usePushNotifications";
import "../global.css";

const CartSyncProvider = () => {
  useCartSocketSync();
  return null;
};

const PushNotificationProvider = () => {
  usePushNotifications();
  return null;
};


const SPLASH_LOGO = require('../assets/images/splash-icon.png');

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    "Inter-Thin": Inter_100Thin,
    "Inter-ExtraLight": Inter_200ExtraLight,
    "Inter-Light": Inter_300Light,
    "Inter-Regular": Inter_400Regular,
    "Inter-Medium": Inter_500Medium,
    "Inter-SemiBold": Inter_600SemiBold,
    "Inter-Bold": Inter_700Bold,
    "Inter-ExtraBold": Inter_800ExtraBold,
    "Inter-Black": Inter_900Black,
  });

  const isAuthLoaded = useAuthStore((s) => s.isLoaded);
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setButtonStyleAsync('dark').catch(() => {});
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
    if ((loaded || error) && isAuthLoaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error, isAuthLoaded]);

  if ((!loaded && !error) || !isAuthLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }}>
        <Image source={SPLASH_LOGO} style={{ width: 200, height: 200 }} resizeMode="contain" />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <View style={{ flex: 1, backgroundColor: "#fff" }}>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="(modal)" />
              <Stack.Screen name="(prescription)" />
              <Stack.Screen name="search" options={{ animation: 'fade', animationDuration: 180 }} />
              <Stack.Screen name="frequent-orders" />
              <Stack.Screen name="notifications" />
              <Stack.Screen name="profile" />
              <Stack.Screen name="product" options={{ presentation: 'transparentModal', animation: 'none', gestureEnabled: false }} />
            </Stack>
            <CartSyncProvider />
            <PushNotificationProvider />
            <NetworkToast />
          </View>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
