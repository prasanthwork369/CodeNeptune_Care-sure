import { useAuthStore } from "@/src/store/authStore";
import { Redirect, Stack, useSegments } from "expo-router";

export default function ModalLayout() {
  const { isAuthenticated } = useAuthStore();
  const segments = useSegments();
  const modalRoute = segments[1];
  const isGuestAllowed = modalRoute === "cart" || modalRoute === "coupons";

  if (!isAuthenticated && !isGuestAllowed)
    return <Redirect href="/(auth)/login" />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="cart"
        options={{
          presentation: "card",
          animation: "slide_from_right",
          animationDuration: 320,
        }}
      />
      <Stack.Screen
        name="coupons"
        options={{
          presentation: "card",
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="order-success"
        options={{ presentation: "transparentModal", animation: "fade" }}
      />
    </Stack>
  );
}
