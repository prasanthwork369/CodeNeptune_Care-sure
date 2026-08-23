import { useAuthStore } from "@/src/store/authStore";
import {
  isRouteFresh,
  useLastRouteStore,
  waitForLastRouteHydration,
} from "@/src/store/lastRouteStore";
import { Href, Redirect } from "expo-router";
import { useEffect, useState } from "react";

export default function Index() {
  // Field selectors: a whole-store subscription re-rendered this and every
  // navigator layout on each setUser call during startup.
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isGuest = useAuthStore((s) => s.isGuest);
  const isLoaded = useAuthStore((s) => s.isLoaded);

  const [isRouteLoaded, setIsRouteLoaded] = useState(
    useLastRouteStore.persist.hasHydrated(),
  );
  useEffect(() => {
    if (isRouteLoaded) return;
    waitForLastRouteHydration().then(() => setIsRouteLoaded(true));
  }, [isRouteLoaded]);

  if (!isLoaded || !isRouteLoaded) return null;

  if (!(isAuthenticated || isGuest)) {
    return <Redirect href="/(auth)/login" />;
  }

  // Restore the last safe screen after a process recreation (e.g. the user
  // backgrounded the app to change a permission in Settings and came back),
  // as long as it's recent enough to be that, not a genuine fresh launch.
  const { pathname, params, savedAt } = useLastRouteStore.getState();
  if (pathname && isRouteFresh(savedAt)) {
    return (
      <Redirect href={{ pathname, params: params ?? undefined } as unknown as Href} />
    );
  }

  return <Redirect href="/(tabs)" />;
}
