import {
  QueryClient,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback } from "react";
import { orderApi } from "@/src/features/orders/api/order.api";
import { QUERY_KEYS } from "@/src/lib/react-query/queryKeys";
import { BACKGROUND_QUERY_META } from "@/src/lib/react-query/queryClient";
import { useAuthStore } from "@/src/store/authStore";
import { Order } from "@/src/features/orders/types";

// Cancelled and Delivered are terminal — nothing left to poll for.
const TERMINAL_ORDER_STATUSES = [0, 7];

/**
 * Warms the exact ORDERS.BY_ID cache entry useOrderById() reads below, using
 * the same queryFn, so a notification tap can have the fetch already in
 * flight (or done) by the time Order Tracking mounts. Never throws — a
 * failed/slow prefetch just means the destination screen falls back to its
 * own normal fetch-on-mount, same as today.
 */
const prefetchOrder = (queryClient: QueryClient, orderId: string): void => {
  if (!orderId) return;
  void queryClient
    .prefetchQuery({
      queryKey: QUERY_KEYS.CUSTOMER.ORDERS.BY_ID(orderId),
      queryFn: () => orderApi.getOrderById(orderId),
      meta: BACKGROUND_QUERY_META,
    })
    .catch(() => {});
};

/** Stable callback for wiring prefetchOrder into a notification tap. */
export const usePrefetchOrder = () => {
  const queryClient = useQueryClient();
  return useCallback(
    (orderId: string) => prefetchOrder(queryClient, orderId),
    [queryClient],
  );
};

/** Exported standalone so the polling decision is unit-testable without mounting react-query. */
export function getOrderRefetchInterval(
  status: number | undefined,
): number | false {
  return status != null && TERMINAL_ORDER_STATUSES.includes(status)
    ? false
    : 30_000;
}

export const useOrderById = (
  orderId: string | undefined,
): {
  order: Order | undefined;
  loading: boolean;
  isFetching: boolean;
  error: unknown;
  refetch: () => void;
  isPlaceholderData: boolean;
} => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const queryClient = useQueryClient();

  const {
    data: order,
    isLoading,
    isFetching,
    error,
    refetch,
    isPlaceholderData,
  } = useQuery({
    queryKey: QUERY_KEYS.CUSTOMER.ORDERS.BY_ID(orderId!),
    queryFn: () => orderApi.getOrderById(orderId!),
    enabled: isAuthenticated && !!orderId,
    staleTime: 60_000,
    // Active order status can change while the app is backgrounded — refresh
    // it the moment the user comes back, rather than waiting for the poll.
    refetchOnWindowFocus: true,
    refetchInterval: (query) =>
      getOrderRefetchInterval(query.state.data?.status),
    // Paints the row the user just tapped from My Orders instantly, read
    // read-only from the orders-list cache. Deliberately placeholderData, not
    // initialData: it never marks this query "fresh", so the queryFn above
    // still fires unconditionally on mount and replaces it with the real
    // detail response (which carries fields the list never has, e.g.
    // statusLogs, clinicalData, deliveryAddress).
    placeholderData: () => {
      if (!orderId) return undefined;
      const lists = queryClient.getQueriesData<Order[]>({
        queryKey: QUERY_KEYS.CUSTOMER.ORDERS.LIST_ALL,
      });
      for (const [, orders] of lists) {
        const match = orders?.find((o) => o.id === orderId);
        if (match) return match;
      }
      return undefined;
    },
  });

  return { order, loading: isLoading, isFetching, error, refetch, isPlaceholderData };
};
