import { create } from "zustand";

interface NetworkState {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
  offlineAlertVisible: boolean;
  isInitialized: boolean;
  coldLaunchOffline: boolean;
  setIsConnected: (
    connected: boolean | null,
    reachable: boolean | null,
  ) => void;
  /** Reachability alone, for what request outcomes actually prove. */
  setInternetReachable: (reachable: boolean | null) => void;
  showOfflineAlert: () => void;
  hideOfflineAlert: () => void;
}

export const useNetworkStore = create<NetworkState>((set) => ({
  isConnected: null,
  isInternetReachable: null,
  offlineAlertVisible: false,
  isInitialized: false,
  coldLaunchOffline: false,
  setIsConnected: (connected, reachable) =>
    set((state) => {
      const isCurrentlyOffline = connected === false || reachable === false;
      const isCurrentlyOnline = connected === true && reachable === true;

      let nextColdLaunchOffline = state.coldLaunchOffline;
      if (!state.isInitialized) {
        // First network report on cold launch determines if session started offline
        nextColdLaunchOffline = isCurrentlyOffline;
      } else if (isCurrentlyOnline) {
        // Once online in this session, clear coldLaunchOffline
        nextColdLaunchOffline = false;
      }

      return {
        isConnected: connected,
        isInternetReachable: reachable,
        isInitialized: true,
        coldLaunchOffline: nextColdLaunchOffline,
      };
    }),
  setInternetReachable: (reachable) =>
    set((state) => {
      let nextColdLaunchOffline = state.coldLaunchOffline;
      if (reachable === true && state.isConnected === true) {
        nextColdLaunchOffline = false;
      }
      return {
        isInternetReachable: reachable,
        coldLaunchOffline: nextColdLaunchOffline,
      };
    }),
  showOfflineAlert: () => set({ offlineAlertVisible: true }),
  hideOfflineAlert: () => set({ offlineAlertVisible: false }),
}));
