import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orderApi } from "@/src/features/orders/api/order.api";
import { Order, CreateOrderRequest } from "@/src/features/orders/types";
import { QUERY_KEYS } from "@/src/lib/react-query/queryKeys";

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (vars: { data: CreateOrderRequest; idempotencyKey?: string }) =>
      orderApi.createOrder(vars.data, vars.idempotencyKey),
    onSuccess: (newOrder: Order) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOMER.CART });

      // Seed detail cache and immediately mark stale so tracking screen paints
      // from cache while getOrderById fetches full tracking logs & clinicalData in background
      if (newOrder?.id) {
        queryClient.setQueryData(
          QUERY_KEYS.CUSTOMER.ORDERS.BY_ID(newOrder.id),
          newOrder,
        );
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.CUSTOMER.ORDERS.BY_ID(newOrder.id),
        });
      }

      // If the default "All Orders" cache already exists, prepend newOrder to it.
      // If no cache exists yet, avoid creating a partial 1-item array.
      const canonicalKey = QUERY_KEYS.CUSTOMER.ORDERS.LIST({});
      const existingList = queryClient.getQueryData<Order[]>(canonicalKey);

      if (Array.isArray(existingList)) {
        if (!existingList.some((o) => o.id === newOrder?.id)) {
          queryClient.setQueryData<Order[]>(canonicalKey, [
            newOrder,
            ...existingList,
          ]);
        }
      }

      // Initiate default orders list network request immediately in the background
      // with explicit staleTime: 0 so it is guaranteed to hit the network after setQueryData.
      void queryClient
        .prefetchQuery({
          queryKey: canonicalKey,
          queryFn: () => orderApi.listOrders({}),
          staleTime: 0,
        })
        .catch(() => {});

      // Invalidate all orders queries to ensure filtered tabs reconcile on mount
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CUSTOMER.ORDERS.LIST_ALL,
      });

      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CUSTOMER.PRESCRIPTIONS.LIST_ALL,
      });
    },
  });

  return {
    createOrder: (data: CreateOrderRequest, idempotencyKey?: string) =>
      mutation.mutateAsync({ data, idempotencyKey }),
    loading: mutation.isPending,
    error: mutation.error?.message ?? null,
  };
};
