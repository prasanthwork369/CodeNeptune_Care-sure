import { useIsOffline } from "@/src/hooks/ui/useIsOffline";
import { useQueryErrorState } from "@/src/hooks/ui/useQueryErrorState";

/** What a live screen should render instead of itself, or null to render normally. */
export type LiveScreenState = "offline" | "error" | null;

interface LiveScreenStateOptions {
  /** The screen's primary query error, if any. */
  error: unknown;
  /** Whether the screen has data it could render. */
  hasData: boolean;
  /** The primary query's initial-load flag, so a first fetch shows its skeleton. */
  loading?: boolean;
  /**
   * Whether the screen is actually server-backed right now. Pass false when the
   * data on screen is local (a guest cart, a draft), so offline never hides
   * something the network was never going to supply.
   */
  live?: boolean;
}

/**
 * The screen-level gate for live/transactional screens — cart, wallet, orders,
 * checkout, anything priced.
 *
 * Stricter than useQueryErrorState on purpose, and in one specific way: being
 * offline is enough on its own. These screens exist to be acted on, and a
 * cached balance, price or order status is a claim about server state that may
 * already be wrong — so while the device is offline the screen shows the
 * offline state rather than data the user might act on. Content screens keep
 * using useQueryErrorState directly and keep their cache visible.
 *
 * "error" is the online case: a real failure with nothing to fall back on.
 *
 * Connectivity is read from the shared network store via useIsOffline — a
 * selector over the one app-wide NetInfo listener, so this adds no listener of
 * its own and stays consistent with the request gate and onlineManager.
 */
export function useLiveScreenState({
  error,
  hasData,
  loading = false,
  live = true,
}: LiveScreenStateOptions): LiveScreenState {
  const isDeviceOffline = useIsOffline();
  const errorState = useQueryErrorState(error);

  if (!live) return null;
  // Device state, not query state: shown immediately, without waiting for a
  // fetch that cannot succeed to fail first.
  if (isDeviceOffline) return "offline";
  if (!loading && !hasData && errorState) return "error";
  return null;
}
