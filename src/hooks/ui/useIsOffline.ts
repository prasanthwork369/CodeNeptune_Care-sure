import { useNetworkStatus } from "@/src/hooks/useNetworkStatus";

/** Shorthand for the common render check — useNetworkStatus owns the derivation. */
export function useIsOffline(): boolean {
  return useNetworkStatus().isOffline;
}
