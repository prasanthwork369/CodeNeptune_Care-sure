import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback } from "react";

/**
 * Drop-in for useRouter().
 * Uses navigation.isFocused() — the React Navigation standard guard.
 * Once a push begins the current screen loses focus, so any rapid
 * follow-up press finds isFocused()=false and is silently dropped.
 */
export function useNav() {
  const router = useRouter();
  const navigation = useNavigation();

  const push = useCallback(
    (...args: Parameters<typeof router.push>) => {
      if (!navigation.isFocused()) return;
      router.push(...args);
    },
    [router, navigation]
  );

  const replace = useCallback(
    (...args: Parameters<typeof router.replace>) => {
      if (!navigation.isFocused()) return;
      router.replace(...args);
    },
    [router, navigation]
  );

  const back = useCallback(() => {
    router.back();
  }, [router]);

  return { push, replace, back };
}
