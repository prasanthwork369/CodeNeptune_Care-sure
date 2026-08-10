import { useSettings } from "@/src/hooks/queries/useSettings";
import { isUpdateRequired } from "@/src/utils/appVersion";

export type AppGateReason = "update" | "maintenance" | null;

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
  const { data } = useSettings();

  if (data?.maintenanceMode === true) {
     return { reason: "maintenance", maintenanceMessage: data.maintenanceMessage };
  }
  if (isUpdateRequired(data?.minSupportedVersion)) {
    return { reason: "update" };
  }
  return { reason: null };
}
