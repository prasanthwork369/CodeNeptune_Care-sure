import NetInfo from "@react-native-community/netinfo";
import type { AxiosInstance } from "axios";
import { useNetworkStore } from "../store/useNetworkStore";
import { requestQueue } from "./requestQueue";

/**
 * Gate a network action on a usable connection, showing the offline dialog when
 * there isn't one. Connected-but-unreachable counts as offline: such a request
 * only hangs until the axios timeout and then fails anyway.
 */
export const ensureOnline = (): boolean => {
  const { isConnected, isInternetReachable } = useNetworkStore.getState();
  if (isConnected === false || isInternetReachable === false) {
    useNetworkStore.getState().showOfflineAlert();
    return false;
  }
  return true;
};

export const initNetworkListener = (axiosInstance: AxiosInstance) => {
  requestQueue.loadFromStorage();

  return NetInfo.addEventListener((state) => {
    const isConnected = state.isConnected;
    const isInternetReachable = state.isInternetReachable;

    const wasFullyConnected =
      useNetworkStore.getState().isConnected === true &&
      useNetworkStore.getState().isInternetReachable === true;

    useNetworkStore.getState().setIsConnected(isConnected, isInternetReachable);

    const isNowFullyConnected =
      isConnected === true && isInternetReachable === true;
    if (!wasFullyConnected && isNowFullyConnected) {
      requestQueue.process(axiosInstance);
    }
  });
};
