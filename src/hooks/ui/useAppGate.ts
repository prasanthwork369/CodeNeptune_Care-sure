import { useSettings } from "@/src/hooks/queries/useSettings";
import { isUpdateRequired } from "@/src/utils/appVersion";
import { getDevGatePreview } from "@/src/utils/devFlags";
import { useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";

export type AppGateReason = "update" | "maintenance" | null;

// Rapid app switching must not hammer the endpoint; one check a minute is
// plenty for a gate whose value changes at most a few times a year.
const RECHECK_THROTTLE_MS = 60_000;

/**
 * Decides whether the app must be blocked before the user can continue.
 *
 * Fail-open by design: the settings query failing, the fields being absent
 * (the backend does not serve them yet), or an unreadable version all resolve
 * to "no block". Only an explicit, parseable signal closes the gate.
 */
export function useAppGate(): {
  reason: AppGateReason;
  maintenanceMessage?: string;
} {
  const { data, refetch } = useSettings();
  const lastCheckedAt = useRef(0);
  const devPreview = __DEV__ ? getDevGatePreview() : null;

  // useSettings opts out of window-focus refetches, so we manually recheck
  // on app foreground with a 60s throttle to catch urgent maintenance/updates.
  useEffect(() => {
    lastCheckedAt.current = Date.now();
    const sub = AppState.addEventListener("change", (s: AppStateStatus) => {
      if (s !== "active") return;
      const now = Date.now();
      if (now - lastCheckedAt.current < RECHECK_THROTTLE_MS) return;
      lastCheckedAt.current = now;
      refetch();
    });
    return () => sub.remove();
  }, [refetch]);

  // Dev preview override: allow quickly forcing gate screens locally.
  if (devPreview === "maintenance") {
    return {
      reason: "maintenance",
      maintenanceMessage: "Dev: maintenance preview",
    };
  }
  if (devPreview === "update") {
    return { reason: "update" };
  }

  if (data?.maintenanceMode === true) {
    return {
      reason: "maintenance",
      maintenanceMessage: data.maintenanceMessage,
    };
  }
  if (isUpdateRequired(data?.minSupportedVersion)) {
    return { reason: "update" };
  }
  return { reason: null };
}
