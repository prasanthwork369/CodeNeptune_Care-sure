import {
  MutationCache,
  QueryCache,
  QueryClient,
  onlineManager,
} from "@tanstack/react-query";
import NetInfo from "@react-native-community/netinfo";
import { AppError } from "@/src/api/errors";
import { reportActionError } from "@/src/utils/offline/networkFeedback";

onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected);
  });
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
 */
export interface CareSureMeta extends Record<string, unknown> {
  silentError?: boolean;
}

export const queryClient = new QueryClient({
  // One handler covers every mutation in the app, so no screen needs its own
  // catch just to tell the user something failed.
  mutationCache: new MutationCache({
    onError: (error, _vars, _ctx, mutation) => {
      if ((mutation.meta as CareSureMeta | undefined)?.silentError) return;
      reportActionError(error);
    },
  }),
  // Queries stay quieter: a failed refresh with cached data on screen needs no
  // interruption — the global offline banner already says why. Only an empty
  // cache leaves the user with nothing, so that one gets reported.
  queryCache: new QueryCache({
    onError: (error, query) => {
      if ((query.meta as CareSureMeta | undefined)?.silentError) return;
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
