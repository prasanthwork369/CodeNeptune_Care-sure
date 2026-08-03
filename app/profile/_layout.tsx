import { Redirect, Stack } from "expo-router";
import { useAuthStore } from "@/src/store/authStore";
import { screenTransitions } from "@/src/theme";

export default function ProfileLayout() {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

  return (
    <Stack
      screenOptions={{ headerShown: false, ...screenTransitions.nativePush }}
    >
      {/* Matches order-success, so both terminal confirmations arrive the same way */}
      <Stack.Screen
        name="orders/return-success"
        options={screenTransitions.result}
      />
    </Stack>
  );
}
