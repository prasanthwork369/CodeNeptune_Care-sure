import { useNetworkStatus } from "@/src/hooks/system/useNetworkStatus";

/** Shorthand for the common render check — useNetworkStatus owns the derivation. */
export function useIsOffline(): boolean {
  return useNetworkStatus().isOffline;
}
