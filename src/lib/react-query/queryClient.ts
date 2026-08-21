import {
  MutationCache,
  QueryCache,
  QueryClient,
  onlineManager,
} from "@tanstack/react-query";
import { AppError } from "@/src/api/errors";
import { useNetworkStore } from "@/src/store/useNetworkStore";
import { isOffline } from "@/src/utils/offline/networkState";
import { reportActionError } from "@/src/utils/offline/networkFeedback";

/**
 * React Query's connectivity, driven by the same store — and the same
 * isOffline() predicate — every other part of the app reads.
 *
 * This used to be its own NetInfo listener reading `state.isConnected` alone,
 * which disagreed with isOffline() in exactly the case that matters most:
 * connected-but-unreachable (captive portal, router with no WAN, data saver,
 * a VPN with no route). There the app shows its offline banner and offline
 * states while onlineManager still reads "online" — so when the connection
 * came back, isConnected had never changed, no offline→online transition
 * fired, queryCache.onOnline() never ran, and nothing refetched. The screen
 * sat on NoInternetState until the user pressed Retry.
 *
 * Subscribing to the store instead of NetInfo also means every writer reaches
 * React Query, not just NetInfo: initNetworkListener, NetworkToast's manual
 * Refresh, and reachability learned from real request outcomes
 * (markReachable/markUnreachable). setOnline only notifies on an actual
 * change, so the extra store updates this sees are free no-ops.
 */
onlineManager.setEventListener((setOnline) => {
  setOnline(!isOffline());
  return useNetworkStore.subscribe(() => setOnline(!isOffline()));
});

// Nothing is gained by retrying these: the outcome is already decided.
const NON_RETRYABLE: AppError["kind"][] = [
  "offline",
  "cancelled",
  "unauthorized",
  "forbidden",
  "not_found",
  "validation",
  "network",
  // Retrying a 429 sends three requests where the server asked for none.
  "rate_limited",
  // A conflict is about server state, so an identical retry conflicts again.
  "conflict",
];

/**
 * Anything a mutation or query may set on `meta`.
 * `silentError` opts a mutation out of the global error toast — for screens that
 * render their own inline error (auth OTP, profile form) so the user isn't told
 * twice.
 * `background` marks a prefetch/cache-warm/unattended refresh that nothing on
 * screen is waiting on (see BACKGROUND_QUERY_META below).
 */
export interface CareSureMeta extends Record<string, unknown> {
  silentError?: boolean;
  background?: boolean;
}

/**
 * Attach to `meta` on a prefetchQuery/useQuery call that runs unattended
 * (nothing on screen shows its loading state) — e.g. warming a cache ahead of
 * navigation. A 401 there already ran the apiClient interceptor's
 * refresh/logout flow; a generic toast on top would just repeat "you're
 * logged out" for something the user never asked to see.
 */
export const BACKGROUND_QUERY_META: CareSureMeta = { background: true };

// A background query's 401 is redundant with the interceptor's own
// refresh/logout handling (see apiClient.ts) — everything else (5xx, network)
// still falls through to the normal rules below.
const isSilentBackgroundAuthError = (
  error: unknown,
  meta: CareSureMeta | undefined,
): boolean =>
  !!meta?.background && error instanceof AppError && error.kind === "unauthorized";

export const queryClient = new QueryClient({
  // One handler covers every mutation in the app, so no screen needs its own
  // catch just to tell the user something failed.
  mutationCache: new MutationCache({
    onError: (error, _vars, _ctx, mutation) => {
      const meta = mutation.meta as CareSureMeta | undefined;
      if (meta?.silentError) return;
      if (isSilentBackgroundAuthError(error, meta)) return;
      reportActionError(error);
    },
  }),
  // Queries stay quieter: a failed refresh with cached data on screen needs no
  // interruption — the global offline banner already says why. Only an empty
  // cache leaves the user with nothing, so that one gets reported.
  queryCache: new QueryCache({
    onError: (error, query) => {
      const meta = query.meta as CareSureMeta | undefined;
      if (meta?.silentError) return;
      if (isSilentBackgroundAuthError(error, meta)) return;
      if (query.state.data !== undefined) return;
      reportActionError(error);
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 5 * 60_000,
      // An hour, not a day: product/order/search payloads were the largest
      // heap contributor across a long session. SQLite still backs offline.
      gcTime: 60 * 60_000,
      refetchOnWindowFocus: false,
      // "online" pauses an offline fetch, so refetch() never settles and every
      // pull-to-refresh spinner and skeleton hangs until reconnect. Running it
      // lets the client's offline gate reject immediately instead.
      networkMode: "always",
      // Stale data only, so reconnecting can't stampede the API.
      refetchOnReconnect: true,
      retry: (failureCount, error) => {
        if (error instanceof AppError && NON_RETRYABLE.includes(error.kind)) {
          return false;
        }
        return failureCount < 2;
      },
    },
    mutations: {
      retry: false,
      // Same reason as queries: a paused mutation leaves mutateAsync pending
      // forever and the caller's spinner with it.
      networkMode: "always",
    },
  },
});
