import { useMutation, useQueryClient } from "@tanstack/react-query";
import { returnApi } from "@/src/features/orders/api/return.api";
import { CreateReturnRequest } from "@/src/features/orders/types";
import { QUERY_KEYS } from "@/src/lib/react-query/queryKeys";

export const useCreateReturn = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: CreateReturnRequest) => returnApi.createReturn(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CUSTOMER.RETURNS.LIST_ALL,
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CUSTOMER.ORDERS.BY_ID(variables.orderId),
      });
    },
  });

  return {
    createReturn: (data: CreateReturnRequest) => mutation.mutateAsync(data),
    loading: mutation.isPending,
    error: mutation.error?.message ?? null,
  };
};
