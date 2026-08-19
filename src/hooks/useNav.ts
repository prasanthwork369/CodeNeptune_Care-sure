// eslint-disable-next-line no-restricted-imports
import { useNavigation, useRouter } from "expo-router";

const HOME_ROUTE = "/(tabs)" as const;

/** Drop-in wrapper for useRouter. Uses navigation.isFocused() as a guard to prevent duplicate screen pushes on double taps. */
export function useNav() {
  const router = useRouter();
  const navigation = useNavigation();

  const push = (...args: Parameters<typeof router.push>) => {
    if (!navigation.isFocused()) return;
    router.push(...args);
  };

  const replace = (...args: Parameters<typeof router.replace>) => {
    if (!navigation.isFocused()) return;
    router.replace(...args);
  };

  const canGoBack = () => router.canGoBack();

  const back = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    // Replace route with Home to prevent back button loops on orphaned links
    router.replace(HOME_ROUTE);
  };

  // Pops every screen above target route to clear intermediate flows
  const dismissTo = (...args: Parameters<typeof router.dismissTo>) => {
    if (!navigation.isFocused()) return;
    router.dismissTo(...args);
  };

  // Pops the current nested stack all the way to its root
  const dismissAll = () => {
    if (!navigation.isFocused()) return;
    router.dismissAll();
  };

  return { push, replace, back, canGoBack, dismissTo, dismissAll };
}
