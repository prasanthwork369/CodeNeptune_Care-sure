import { useNav } from "@/src/hooks/useNav";
import { useAuthStore } from "@/src/store/authStore";
import { useLastRouteStore, waitForLastRouteHydration } from "@/src/store/lastRouteStore";
import { Href, Redirect, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function Index() {
  const router = useNav();
  // Field selectors: a whole-store subscription re-rendered this and every
  // navigator layout on each setUser call during startup.
  // Field selectors prevent whole-store subscription re-renders during auth startup
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

  // getState() (not selector) prevents re-deciding after pendingRestore clears
  const restoreTarget = useMemo(() => {
    if (!isRouteLoaded) return null;
    const { pathname, params, pendingRestore } = useLastRouteStore.getState();
    return pendingRestore && pathname
      ? { pathname, params: params ?? undefined }
      : null;
  }, [isRouteLoaded]);

  // One-shot: consume the flag now so it can't restore again on a later launch.
  useEffect(() => {
    if (isRouteLoaded) useLastRouteStore.getState().clearPendingRestore();
  }, [isRouteLoaded]);

  // dismissTo respects seeded (tabs) history; Redirect.replace() would create a duplicate
  const goHome = !isLoaded || !isRouteLoaded
    ? false
    : (isAuthenticated || isGuest) && !restoreTarget;
  useFocusEffect(
    useCallback(() => {
      if (goHome) router.dismissTo("/(tabs)");
    }, [goHome, router]),
  );

  if (!isLoaded || !isRouteLoaded) return null;

  if (!(isAuthenticated || isGuest)) {
    return <Redirect href="/(auth)/login" />;
  }

  if (restoreTarget) {
    return <Redirect href={restoreTarget as unknown as Href} />;
  }

  return null;
}
