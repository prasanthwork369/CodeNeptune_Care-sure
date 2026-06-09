import { useAuthStore } from "@/src/store/authStore";
import { Redirect } from "expo-router";

export default function Index() {
  const { isAuthenticated, isLoaded } = useAuthStore();

  if (!isLoaded) return null;
  return <Redirect href={isAuthenticated ? "/(tabs)" : "/(auth)/login"} />;
}
