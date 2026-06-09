import { useQuery } from '@tanstack/react-query';
import { orderService } from '../../services/order.service';
import { QUERY_KEYS } from '@/src/lib/react-query/queryKeys';
import { useAuthStore } from '../../store/authStore';

interface UseOrdersParams {
    page?: number;
    limit?: number;
    status?: string;
    [key: string]: any;
}

export const useOrders = (params: UseOrdersParams = {}) => {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    const { data: orders = [], isLoading, isRefetching, refetch } = useQuery({
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

export function useFrequentlyOrdered(params: { page?: number; limit?: number } = {}) {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    return useQuery({
        queryKey: ['frequently-ordered', params],
        queryFn: () => orderService.getFrequentlyOrdered(params),
        enabled: isAuthenticated,
        retry: 1,
        refetchOnWindowFocus: false,
    });
}
