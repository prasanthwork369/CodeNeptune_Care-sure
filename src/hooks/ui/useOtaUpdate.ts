import * as Updates from "expo-updates";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";

// Mirrors useInAppUpdate's resume throttle — Play owns that flow's UI, this
// one just avoids re-checking the update server on every foreground.
const RESUME_THROTTLE_MS = 60_000;

/**
 * Drives EAS Update (OTA) checks for JS-only fixes, alongside the native
 * Play in-app update flow (useInAppUpdate) for binary releases.
 *
 * isEnabled is false in Expo Go and any dev/local build that didn't embed
 * expo-updates, so this silently no-ops there instead of needing a
 * platform/build branch at the call site.
 */
export function useOtaUpdate() {
  const [isDownloaded, setIsDownloaded] = useState(false);
  const checkInFlight = useRef(false);
  const lastResumeCheck = useRef(0);

  useEffect(() => {
    if (!Updates.isEnabled) return;

    // Defined inline, not hoisted via useCallback — matches useInAppUpdate's
    // check() so this effect owns the whole async flow itself.
    const checkAndFetch = async () => {
      if (checkInFlight.current) return;
      checkInFlight.current = true;
      try {
        const check = await Updates.checkForUpdateAsync();
        if (!check.isAvailable) return;
        const fetched = await Updates.fetchUpdateAsync();
        if (fetched.isNew) setIsDownloaded(true);
      } catch {
        // Update server unreachable or check failed — try again next launch/resume.
      } finally {
        checkInFlight.current = false;
      }
    };

    const sub = AppState.addEventListener("change", (s: AppStateStatus) => {
      if (s !== "active") return;
      const now = Date.now();
      if (now - lastResumeCheck.current < RESUME_THROTTLE_MS) return;
      lastResumeCheck.current = now;
      checkAndFetch();
    });
    checkAndFetch();
    return () => sub.remove();
  }, []);

  const restartAndInstall = useCallback(async () => {
    try {
      await Updates.reloadAsync();
    } catch {
      // Worst case it applies on the next natural cold start instead.
    }
  }, []);

  return {
    isSupported: Updates.isEnabled,
    isDownloaded,
    restartAndInstall,
  };
}
