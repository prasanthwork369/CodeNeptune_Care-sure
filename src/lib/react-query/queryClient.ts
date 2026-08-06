import {
  MutationCache,
  QueryClient,
  onlineManager,
} from "@tanstack/react-query";
import NetInfo from "@react-native-community/netinfo";
import { AppError } from "@/src/api/errors";

onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected);
  });
});

export const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: () => {},
  }),
  defaultOptions: {
    queries: {
      staleTime: 5 * 60_000,
      // An hour, not a day: product/order/search payloads were the largest
      // heap contributor across a long session. SQLite still backs offline.
      gcTime: 60 * 60_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (error instanceof AppError) {
          if (
            error.kind === "unauthorized" ||
            error.kind === "forbidden" ||
            error.kind === "not_found" ||
            error.kind === "validation" ||
            error.kind === "network"
          ) {
            return false;
          }
        }
        return failureCount < 2;
      },
    },
    mutations: {
      retry: false,
      // "online" pauses a mutation while offline, so mutateAsync never settles and
      // the caller's spinner hangs forever. Let it run: the axios interceptor
      // rejects offline requests immediately and raises the offline dialog.
      networkMode: "always",
    },
  },
});
