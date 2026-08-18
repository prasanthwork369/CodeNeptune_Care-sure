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
}

/**
 * The React-facing view of connectivity. Selects the two primitives rather than
 * the store object, so a component only re-renders when connectivity flips.
 *
 * Use this for rendering (disabled buttons, offline states). For an action's
 * pre-flight check use requireInternet/useOnlineAction — those read the store
 * imperatively and don't tie the check to a render.
 */
export function useNetworkStatus(): NetworkStatus {
  const isConnected = useNetworkStore((s) => s.isConnected);
  const isInternetReachable = useNetworkStore((s) => s.isInternetReachable);

  return useMemo(() => {
    const offline = isConnected === false || isInternetReachable === false;
    return {
      isOnline: !offline,
      isOffline: offline,
      isConnected,
      isInternetReachable,
      isLowNetwork: isConnected === true && isInternetReachable === false,
    };
  }, [isConnected, isInternetReachable]);
}
