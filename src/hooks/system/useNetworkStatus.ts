import { useMemo } from "react";
import { useNetworkStore } from "@/src/store/useNetworkStore";

export interface NetworkStatus {
  isOnline: boolean;
  isOffline: boolean;
  /** Has a transport (wifi/cellular). Null until NetInfo reports. */
  isConnected: boolean | null;
  /** That transport actually reaches the internet. Null until probed. */
  isInternetReachable: boolean | null;
  /** Connected to a network that can't reach the internet. */
  isLowNetwork: boolean;
  /** True once the initial NetInfo check resolves on cold launch. */
  isInitialized: boolean;
  /** True if this app process started offline and has not yet established a live connection. */
  coldLaunchOffline: boolean;
}

/**
 * The React-facing view of connectivity. Selects the primitives rather than
 * the store object, so a component only re-renders when connectivity flips.
 *
 * Use this for rendering (disabled buttons, offline states). For an action's
 * pre-flight check use requireInternet/useOnlineAction — those read the store
 * imperatively and don't tie the check to a render.
 */
export function useNetworkStatus(): NetworkStatus {
  const isConnected = useNetworkStore((s) => s.isConnected);
  const isInternetReachable = useNetworkStore((s) => s.isInternetReachable);
  const isInitialized = useNetworkStore((s) => s.isInitialized);
  const coldLaunchOffline = useNetworkStore((s) => s.coldLaunchOffline);

  return useMemo(() => {
    const offline = isConnected === false || isInternetReachable === false;
    return {
      isOnline: !offline,
      isOffline: offline,
      isConnected,
      isInternetReachable,
      isLowNetwork: isConnected === true && isInternetReachable === false,
      isInitialized,
      coldLaunchOffline,
    };
  }, [isConnected, isInternetReachable, isInitialized, coldLaunchOffline]);
}
