import { useQuery } from "@tanstack/react-query";
import { returnApi } from "@/src/features/orders/api/return.api";
import { QUERY_KEYS } from "@/src/lib/react-query/queryKeys";
import { useAuthStore } from "@/src/store/authStore";

/**
 * Fetches one return's full detail (per-item reason/details) on demand.
 * The order-tracking return status badge only carries id/status — the reason
 * the customer gave when requesting the return isn't in that list, so this
 * is fetched lazily once the customer expands a specific return.
 */
export const useReturnDetail = (
  returnId: string | undefined,
  enabled: boolean,
) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.CUSTOMER.RETURNS.BY_ID(returnId!),
    queryFn: () => returnApi.getReturnById(returnId!),
    enabled: isAuthenticated && !!returnId && enabled,
    staleTime: 5 * 60_000,
  });

  return { returnDetail: data, loading: isLoading, error };
};
