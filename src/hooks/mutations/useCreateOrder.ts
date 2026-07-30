import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orderService } from "../../services/order.service";
import { CreateOrderRequest } from "../../types/order";
import { QUERY_KEYS } from "@/src/lib/react-query/queryKeys";

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (vars: { data: CreateOrderRequest; idempotencyKey?: string }) =>
      orderService.createOrder(vars.data, vars.idempotencyKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOMER.CART });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CUSTOMER.ORDERS.LIST_ALL,
      });
      queryClient.invalidateQueries({
        queryKey: ["customer", "prescriptions"],
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
