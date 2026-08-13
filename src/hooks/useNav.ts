// eslint-disable-next-line no-restricted-imports
import { useNavigation, useRouter } from "expo-router";
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

  // Pops every screen above the given route in one go — for flows entered
  // through a variable number of intermediate screens (e.g. picking an
  // existing prescription pushes prescription-history + the viewer on top
  // of choose-method), so "leaving" always lands cleanly on the real origin
  // instead of a single back() peeling off just one of those layers.
  const dismissTo = useCallback(
    (...args: Parameters<typeof router.dismissTo>) => {
      if (!navigation.isFocused()) return;
      router.dismissTo(...args);
    },
    [router, navigation],
  );

  // Pops the current nested stack all the way to its own root — no route-name
  // matching involved, so nothing for params/getId to mismatch on. Use this
  // (then replace at the root) when dismissTo's name lookup isn't reliably
  // finding an existing screen further up the same stack.
  const dismissAll = useCallback(() => {
    if (!navigation.isFocused()) return;
    router.dismissAll();
  }, [router, navigation]);

  return useMemo(
    () => ({ push, replace, back, canGoBack, dismissTo, dismissAll }),
    [push, replace, back, canGoBack, dismissTo, dismissAll],
  );
}
