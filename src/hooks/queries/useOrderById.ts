import { useQuery } from '@tanstack/react-query';
import { orderService } from '../../services/order.service';
import { QUERY_KEYS } from '@/src/lib/react-query/queryKeys';
import { useAuthStore } from '../../store/authStore';
import { Order } from '../../types/order';

export const useOrderById = (orderId: string | undefined): { order: Order | undefined; loading: boolean } => {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    const { data: order, isLoading } = useQuery({
        queryKey: QUERY_KEYS.CUSTOMER.ORDERS.BY_ID(orderId!),
        queryFn: () => orderService.getOrderById(orderId!),
        enabled: isAuthenticated && !!orderId,
        staleTime: 60_000,
    });

    return { order, loading: isLoading };
};
