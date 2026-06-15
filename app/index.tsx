import { useAuthStore } from "@/src/store/authStore";
import { Redirect } from "expo-router";

export default function Index() {
  const { isAuthenticated, isGuest, isLoaded } = useAuthStore();

  if (!isLoaded) return null;
  return <Redirect href={isAuthenticated || isGuest ? "/(tabs)" : "/(auth)/login"} />;
}
