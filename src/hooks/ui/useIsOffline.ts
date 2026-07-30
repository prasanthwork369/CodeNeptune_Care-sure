import { useNetworkStore } from "@/src/store/useNetworkStore";

export function useIsOffline(): boolean {
  const isConnected = useNetworkStore((s) => s.isConnected);
  const isInternetReachable = useNetworkStore((s) => s.isInternetReachable);
  return isConnected === false || isInternetReachable === false;
}
