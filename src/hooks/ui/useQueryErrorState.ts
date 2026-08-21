import { useMemo } from "react";
import { AppError } from "@/src/api/errors";
import { useIsOffline } from "@/src/hooks/ui/useIsOffline";

/**
 * What a failed query should render, once. `null` means "nothing to show" —
 * either there was no error, or it was a cancellation (a debounce/unmount
 * abort, which the user neither caused nor can fix).
 */
export type QueryErrorState = "offline" | "not_found" | "server" | null;

/**
 * Classifies a query's error into the one state a screen should render, so no
 * screen re-derives the rule and none of them subscribe to NetInfo themselves
 * (useIsOffline selects from the single store the app-wide listener writes).
 *
 * The offline rule matches reportActionError exactly: a bare "network" error
 * (request sent, no response) only counts as offline when the device itself is
 * offline right now — otherwise it is a genuine server-side outage and belongs
 * in the retry state, not behind "check your connection".
 *
 * Callers must still gate on the absence of usable data, so a failed background
 * refresh never replaces content that is already on screen:
 *
 *   const errorState = useQueryErrorState(error);
 *   if (!data && errorState === "offline") return <NoInternetState ... />;
 */
export function useQueryErrorState(error: unknown): QueryErrorState {
  const isDeviceOffline = useIsOffline();

  return useMemo(() => {
    if (!error) return null;
    const kind = error instanceof AppError ? error.kind : undefined;
    if (kind === "cancelled") return null;
    if (kind === "offline" || (kind === "network" && isDeviceOffline)) {
      return "offline";
    }
    if (kind === "not_found") return "not_found";
    return "server";
  }, [error, isDeviceOffline]);
}
