import type { OrderListParams } from "@/src/api/order.api";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { orderService } from "../../services/order.service";
import { QUERY_KEYS } from "@/src/lib/react-query/queryKeys";
import { useAuthStore } from "../../store/authStore";
import { apiCache, withSqliteCache } from "@/src/lib/sqlite/cache";

type UseOrdersParams = OrderListParams;

export const useOrders = (params: UseOrdersParams = {}) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const {
    data: orders = [],
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.CUSTOMER.ORDERS.LIST(params),
    queryFn: () => orderService.listOrders(params),
    enabled: isAuthenticated,
    staleTime: 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return {
    orders,
    loading: isLoading,
    refreshing: isRefetching,
    refetch,
  };
};

export function useFrequentlyOrdered(
  params: { page?: number; limit?: number } = {},
) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  // Read once per mount — this is a blocking getFirstSync + JSON.parse, and
  // React Query only consumes it to seed initialData.
  const [cachedFreq] = useState(() =>
    apiCache.getWithMeta<
      Awaited<ReturnType<typeof orderService.getFrequentlyOrdered>>
    >("frequently_ordered"),
  );

  return useQuery({
    queryKey: ["frequently-ordered", params],
    queryFn: withSqliteCache("frequently_ordered", () =>
      orderService.getFrequentlyOrdered(params),
    ),
    initialData: () => cachedFreq?.data,
    initialDataUpdatedAt: () => cachedFreq?.updatedAt ?? 0,
    enabled: isAuthenticated,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
