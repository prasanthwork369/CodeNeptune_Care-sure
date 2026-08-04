import { Redirect, Stack } from "expo-router";
import { useAuthStore } from "@/src/store/authStore";
import { screenTransitions } from "@/src/theme";

export default function NotificationsLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

  return (
    <Stack
      screenOptions={{ headerShown: false, ...screenTransitions.nativePush }}
    />
  );
}
