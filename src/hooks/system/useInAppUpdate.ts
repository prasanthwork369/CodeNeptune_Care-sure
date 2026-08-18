import {
  addInstallStateListener,
  checkUpdateAvailability,
  completeFlexibleUpdate,
  isInAppUpdateSupported,
  startFlexibleUpdate,
  startImmediateUpdate,
} from "@/src/modules/InAppUpdate";
import { openAppStore } from "@/src/utils/appVersion";
import {
  getDevUpdateReady,
  setDevUpdateReady,
  subscribeDevUpdateReady,
} from "@/src/utils/devFlags";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { AppState, AppStateStatus } from "react-native";

// Play's own dialog is already on screen during a flow; re-checking on every
// resume would relaunch it. One check a minute is enough to catch a download
// that finished while the app was backgrounded.
const RESUME_THROTTLE_MS = 60_000;

/**
 * Drives Google Play In-App Updates for the version gate.
 *
 * Play owns the update UI — this only decides which flow to request and when.
 * Anything unsupported (iOS, sideloaded build, emulator without Play) falls
 * back to the store link, so the caller never needs a platform branch.
 */
export function useInAppUpdate() {
  const [isDownloaded, setIsDownloaded] = useState(false);
  // Dev-only preview of the "update ready" banner; always false in production.
  const devReady = useSyncExternalStore(
    subscribeDevUpdateReady,
    getDevUpdateReady,
  );
  // Refs, not state: these guard against a second launch within the same tick,
  // which state updates are too slow to prevent.
  const immediateLaunched = useRef(false);
  const flexibleLaunched = useRef(false);
  const lastResumeCheck = useRef(0);

  useEffect(
    () =>
      addInstallStateListener((event) => {
        if (event.status === "downloaded") setIsDownloaded(true);
        if (event.status === "failed" || event.status === "cancelled") {
          flexibleLaunched.current = false;
        }
      }),
    [],
  );

  /**
   * Immediate is for the forced path. On failure it degrades to the store link
   * rather than leaving the user on a blocked screen with nothing to do.
   */
  const runImmediateUpdate = useCallback(async (): Promise<boolean> => {
    if (immediateLaunched.current) return true;
    immediateLaunched.current = true;

    const result = await startImmediateUpdate();
    if (result === "cancelled") {
      // Declining must not permanently disable retry — the gate still blocks.
      immediateLaunched.current = false;
      return true;
    }
    if (result === "unavailable" || result === "failed") {
      immediateLaunched.current = false;
      await openAppStore();
      return false;
    }
    return true;
  }, []);

  /** Flexible is for the optional path: it downloads while the app stays usable. */
  const runFlexibleUpdate = useCallback(async (): Promise<boolean> => {
    if (flexibleLaunched.current) return true;
    flexibleLaunched.current = true;

    const result = await startFlexibleUpdate();
    if (result === "unavailable" || result === "failed") {
      flexibleLaunched.current = false;
      await openAppStore();
      return false;
    }
    if (result === "cancelled") {
      flexibleLaunched.current = false;
    }
    return true;
  }, []);

  const restartAndInstall = useCallback(async () => {
    // Clears the preview so the dev banner behaves like the real one.
    setDevUpdateReady(false);
    const ok = await completeFlexibleUpdate();
    // completeUpdate restarts the app; only a failure returns here.
    if (!ok) setIsDownloaded(false);
  }, []);

  // Resume handling: Play can finish a download, or leave an immediate update
  // half-completed, while the app is in the background.
  useEffect(() => {
    if (!isInAppUpdateSupported()) return;

    const check = async () => {
      const now = Date.now();
      if (now - lastResumeCheck.current < RESUME_THROTTLE_MS) return;
      lastResumeCheck.current = now;

      const info = await checkUpdateAvailability();
      if (info.installStatus === "downloaded") setIsDownloaded(true);
      // Play requires an interrupted immediate update to be resumed.
      if (info.immediateInProgress) {
        immediateLaunched.current = false;
        await runImmediateUpdate();
      }
    };

    const sub = AppState.addEventListener("change", (s: AppStateStatus) => {
      if (s === "active") check();
    });
    check();
    return () => sub.remove();
  }, [runImmediateUpdate]);

  return {
    isSupported: isInAppUpdateSupported(),
    isDownloaded: isDownloaded || devReady,
    runImmediateUpdate,
    runFlexibleUpdate,
    restartAndInstall,
  };
}
