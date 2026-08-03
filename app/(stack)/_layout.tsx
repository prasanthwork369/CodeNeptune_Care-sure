import { useAuthStore } from "@/src/store/authStore";
import { screenTransitions } from "@/src/theme";
import { Redirect, Stack, useSegments } from "expo-router";

export default function StackLayout() {
  const { isAuthenticated } = useAuthStore();
  const segments = useSegments() as string[];
  const currentRoute = segments[1];

  const isGuestAllowed = currentRoute === "cart" || currentRoute === "coupons";

  if (!isAuthenticated && !isGuestAllowed) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        ...screenTransitions.nativePush,
      }}
    >
      <Stack.Screen name="cart" options={{ presentation: "card" }} />

      <Stack.Screen name="coupons" options={{ presentation: "card" }} />

      <Stack.Screen
        name="order-success"
        options={{
          presentation: "transparentModal",
          ...screenTransitions.result,
        }}
      />
    </Stack>
  );
}
