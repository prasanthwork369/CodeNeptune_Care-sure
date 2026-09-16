import { useMutation, useQueryClient } from "@tanstack/react-query";
import { returnApi } from "@/src/features/orders/api/return.api";
import { QUERY_KEYS } from "@/src/lib/react-query/queryKeys";

export interface CancelReturnArgs {
  returnId: string;
  /** Order UUID, so that order's detail cache refreshes too. */
  orderUuid?: string;
  reason?: string;
}

/**
 * Cancels a return the customer no longer wants. Backend rejects anything past
 * pickup, so callers gate on isReturnCancellable before offering this.
 */
export const useCancelReturn = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ returnId, reason }: CancelReturnArgs) =>
      returnApi.cancelReturn(returnId, reason),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CUSTOMER.RETURNS.LIST_ALL,
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CUSTOMER.RETURNS.BY_ID(vars.returnId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CUSTOMER.ORDERS.LIST_ALL,
      });
      if (vars.orderUuid) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.CUSTOMER.ORDERS.BY_ID(vars.orderUuid),
        });
      }
    },
  });

  return {
    cancelReturn: mutation.mutateAsync,
    isCancelling: mutation.isPending,
  };
};
