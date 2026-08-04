import { useAuthStore } from "@/src/store/authStore";
import { Redirect } from "expo-router";

export default function Index() {
  // Field selectors: a whole-store subscription re-rendered this and every
  // navigator layout on each setUser call during startup.
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isGuest = useAuthStore((s) => s.isGuest);
  const isLoaded = useAuthStore((s) => s.isLoaded);

  if (!isLoaded) return null;
  return (
    <Redirect href={isAuthenticated || isGuest ? "/(tabs)" : "/(auth)/login"} />
  );
}
