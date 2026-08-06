import { useNetworkStore } from "@/src/store/useNetworkStore";

/**
 * Pure reads of the current connection — no UI, no side effects. NetInfo (via
 * initNetworkListener) is the only writer of the underlying state.
 *
 * Connected-but-unreachable counts as offline: such a request only hangs until
 * the axios timeout and then fails anyway. `null` means "not determined yet" and
 * is treated as online, so a cold start never blocks the first action.
 */
export const isOffline = (): boolean => {
  const { isConnected, isInternetReachable } = useNetworkStore.getState();
  return isConnected === false || isInternetReachable === false;
};

export const isOnline = (): boolean => !isOffline();
