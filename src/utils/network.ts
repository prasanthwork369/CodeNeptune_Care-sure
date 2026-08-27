import NetInfo from "@react-native-community/netinfo";
import type { AxiosInstance } from "axios";
import { useNetworkStore } from "../store/useNetworkStore";
import { requestQueue } from "./requestQueue";

/**
 * NetInfo → store bridge. The only writer of connection state; everything else
 * reads it through useNetworkStatus (render) or requireInternet (actions).
 */
export const initNetworkListener = (axiosInstance: AxiosInstance) => {
  requestQueue.loadFromStorage();

  // Eagerly resolve initial state so cold launch status is known immediately
  NetInfo.fetch().then((state) => {
    useNetworkStore
      .getState()
      .setIsConnected(state.isConnected, state.isInternetReachable);
  });

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
