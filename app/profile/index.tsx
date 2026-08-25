import { useNav } from "@/src/hooks/useNav";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";

// Bare "/profile" is ambiguous with the Profile tab ((tabs)/profile.tsx) —
// this route only exists so a deep link or Settings-return restore that
// saved "/profile" still resolves somewhere. The tab is canonical.
//
// dismissTo, not <Redirect>: replace() doesn't know "(tabs)" is already
// seeded in this stack's history (see app/index.tsx) and would mount a
// second one — dismissTo reuses the existing instance and switches its tab.
export default function ProfileIndexRedirect() {
  const router = useNav();
  useFocusEffect(
    useCallback(() => {
      router.dismissTo("/(tabs)/profile");
    }, [router]),
  );
  return null;
}
