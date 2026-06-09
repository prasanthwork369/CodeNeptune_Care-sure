import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '../../services/order.service';
import { CreateOrderRequest } from '../../types/order';
import { QUERY_KEYS } from '@/src/lib/react-query/queryKeys';

export const useCreateOrder = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (data: CreateOrderRequest) => orderService.createOrder(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOMER.CART });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOMER.ORDERS.LIST() });
        },
    });

    return {
        createOrder: (data: CreateOrderRequest) => mutation.mutateAsync(data),
        loading: mutation.isPending,
        error: mutation.error?.message ?? null,
    };
};
