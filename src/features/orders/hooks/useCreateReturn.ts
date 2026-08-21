import { useMutation, useQueryClient } from "@tanstack/react-query";
import { returnApi } from "@/src/features/orders/api/return.api";
import { orderApi } from "@/src/features/orders/api/order.api";
import {
  CreateReturnRequest,
  Order,
  ReturnRecord,
} from "@/src/features/orders/types";
import { QUERY_KEYS } from "@/src/lib/react-query/queryKeys";
import { BACKGROUND_QUERY_META } from "@/src/lib/react-query/queryClient";

export interface CreateReturnMutationArgs {
  data: CreateReturnRequest;
  orderUuid: string;
}

const DEFAULT_ORDERS_PARAMS = {};

export const useCreateReturn = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (vars: CreateReturnMutationArgs) => returnApi.createReturn(vars.data),
    onSuccess: (newReturn: ReturnRecord, vars) => {
      const { orderUuid } = vars;

      // 1. Invalidate returns list cache
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CUSTOMER.RETURNS.LIST_ALL,
      });

      // 2. Map authoritative return entry directly from server response without fabrication
      const updateOrderWithReturn = (oldOrder?: Order): Order | undefined => {
        if (!oldOrder || !newReturn?.id) return oldOrder;
        const existingReturns = oldOrder.returns ?? [];
        if (existingReturns.some((r) => r.id === newReturn.id)) {
          return oldOrder;
        }

        const newEntry: NonNullable<Order["returns"]>[number] = {
          id: newReturn.id,
          status: newReturn.status,
          createdAt: newReturn.createdAt,
        };

        return {
          ...oldOrder,
          returns: [newEntry, ...existingReturns],
        };
      };

      // 3. Immediately update canonical order detail cache using primary UUID
      if (orderUuid) {
        queryClient.setQueryData<Order>(
          QUERY_KEYS.CUSTOMER.ORDERS.BY_ID(orderUuid),
          updateOrderWithReturn,
        );
        // Invalidate and background-refetch to guarantee authoritative reconciliation
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.CUSTOMER.ORDERS.BY_ID(orderUuid),
        });
        void queryClient
          .prefetchQuery({
            queryKey: QUERY_KEYS.CUSTOMER.ORDERS.BY_ID(orderUuid),
            queryFn: () => orderApi.getOrderById(orderUuid),
            staleTime: 0,
            meta: BACKGROUND_QUERY_META,
          })
          .catch(() => {});
      }

      // 4. Update existing orders list caches so My Orders reflects active return state immediately
      queryClient.setQueriesData<Order[]>(
        { queryKey: QUERY_KEYS.CUSTOMER.ORDERS.LIST_ALL },
        (oldOrders) => {
          if (!Array.isArray(oldOrders)) return oldOrders;
          return oldOrders.map((o) => {
            if (o.id === orderUuid) {
              return updateOrderWithReturn(o) ?? o;
            }
            return o;
          });
        },
      );

      // Invalidate orders list queries
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CUSTOMER.ORDERS.LIST_ALL,
      });

      // Background refresh canonical My Orders list using exact matching query params
      void queryClient
        .prefetchQuery({
          queryKey: QUERY_KEYS.CUSTOMER.ORDERS.LIST(DEFAULT_ORDERS_PARAMS),
          queryFn: () => orderApi.listOrders(DEFAULT_ORDERS_PARAMS),
          staleTime: 0,
          meta: BACKGROUND_QUERY_META,
        })
        .catch(() => {});
    },
  });

  return {
    createReturn: (vars: CreateReturnMutationArgs) =>
      mutation.mutateAsync(vars),
    loading: mutation.isPending,
    error: mutation.error?.message ?? null,
  };
};
