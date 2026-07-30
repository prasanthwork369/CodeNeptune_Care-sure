import { useNavigation } from "@react-navigation/native";
// eslint-disable-next-line no-restricted-imports
import { useRouter } from "expo-router";
import { useCallback, useMemo } from "react";

const HOME_ROUTE = "/(tabs)" as const;

/**
 * Drop-in for useRouter().
 * Uses navigation.isFocused() — the React Navigation standard guard.
 * Once a push begins the current screen loses focus, so any rapid
 * follow-up press finds isFocused()=false and is silently dropped.
 *
 * `back` is safe for routes opened as navigation roots (for example a cold
 * deep link). It pops normal history when available and replaces an orphaned
 * route with Home when no previous route exists.
 */
export function useNav() {
  const router = useRouter();
  const navigation = useNavigation();

  const push = useCallback(
    (...args: Parameters<typeof router.push>) => {
      if (!navigation.isFocused()) return;
      router.push(...args);
    },
    [router, navigation],
  );

  const replace = useCallback(
    (...args: Parameters<typeof router.replace>) => {
      if (!navigation.isFocused()) return;
      router.replace(...args);
    },
    [router, navigation],
  );

  const canGoBack = useCallback(() => router.canGoBack(), [router]);

  const back = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    // Replace rather than push so an orphaned deep-link destination is removed
    // and Home becomes the root. The next Android Back therefore exits the app.
    router.replace(HOME_ROUTE);
  }, [router]);

  return useMemo(
    () => ({ push, replace, back, canGoBack }),
    [push, replace, back, canGoBack],
  );
}
