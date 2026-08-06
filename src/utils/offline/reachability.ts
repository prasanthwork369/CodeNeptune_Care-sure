import { useNetworkStore } from "@/src/store/useNetworkStore";

/**
 * Reachability learned from real request outcomes, which NetInfo's own probe can
 * be slow or wrong about.
 *
 * The case that needs it: the OS lets the app keep a live wifi/cellular
 * transport but blocks the app's own network access (per-app data restriction on
 * Vivo/Xiaomi/Samsung, data saver, a VPN with no route). NetInfo still reports
 * connected, and its reachability probe only flips after its own interval — so
 * every tap in that window fires a doomed request.
 *
 * A failed request is direct evidence, so it marks unreachable immediately and
 * the banner plus the action gate engage at once. A successful one is equally
 * direct evidence the other way, and is what keeps a wrong "unreachable" from
 * ever latching the app into a dead state — NetInfo events also overwrite it.
 */
export const markUnreachable = (): void => {
  const { isInternetReachable, setInternetReachable } =
    useNetworkStore.getState();
  if (isInternetReachable === false) return;
  setInternetReachable(false);
};

export const markReachable = (): void => {
  const { isInternetReachable, setInternetReachable } =
    useNetworkStore.getState();
  if (isInternetReachable === true) return;
  setInternetReachable(true);
};
