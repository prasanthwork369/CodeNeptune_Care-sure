import { useSettings } from "@/src/hooks/queries/useSettings";
import { isUpdateRequired } from "@/src/utils/appVersion";
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
  const lastCheckedAt = useRef(Date.now());

  // React Query's focusManager is not wired to AppState in this app, so
  // refetchOnWindowFocus would do nothing. Without this the gate is only
  // evaluated at cold start — an urgent forced update would miss every user
  // who keeps the app backgrounded rather than closing it.
  useEffect(() => {
    const sub = AppState.addEventListener("change", (s: AppStateStatus) => {
      if (s !== "active") return;
      const now = Date.now();
      if (now - lastCheckedAt.current < RECHECK_THROTTLE_MS) return;
      lastCheckedAt.current = now;
      refetch();
    });
    return () => sub.remove();
  }, [refetch]);

  if (data?.maintenanceMode === true) {
     return { reason: "maintenance", maintenanceMessage: data.maintenanceMessage };
  }
  if (isUpdateRequired(data?.minSupportedVersion)) {
    return { reason: "update" };
  }
  return { reason: null };
}
