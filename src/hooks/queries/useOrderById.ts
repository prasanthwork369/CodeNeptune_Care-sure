import { useQuery } from "@tanstack/react-query";
import { orderService } from "../../services/order.service";
import { QUERY_KEYS } from "@/src/lib/react-query/queryKeys";
import { useAuthStore } from "../../store/authStore";
import { Order } from "../../types/order";

// Cancelled and Delivered are terminal — nothing left to poll for.
const TERMINAL_ORDER_STATUSES = [0, 7];

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
): { order: Order | undefined; loading: boolean } => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const { data: order, isLoading } = useQuery({
    queryKey: QUERY_KEYS.CUSTOMER.ORDERS.BY_ID(orderId!),
    queryFn: () => orderService.getOrderById(orderId!),
    enabled: isAuthenticated && !!orderId,
    staleTime: 60_000,
    refetchInterval: (query) => getOrderRefetchInterval(query.state.data?.status),
  });

  return { order, loading: isLoading };
};
