import { useQuery } from '@tanstack/react-query';
import { returnService } from '../../services/return.service';
import { QUERY_KEYS } from '@/src/lib/react-query/queryKeys';
import { useAuthStore } from '../../store/authStore';

export const useReturns = (params?: Record<string, any>) => {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    const { data, isLoading, isRefetching, refetch } = useQuery({
        queryKey: QUERY_KEYS.CUSTOMER.RETURNS.LIST(params),
        queryFn: () => returnService.listReturns(params),
        enabled: isAuthenticated,
        staleTime: 60_000,
    });

    return {
        returns: data ?? [],
        loading: isLoading,
        refreshing: isRefetching,
        refetch,
    };
};

export const useReturnById = (id: string | undefined) => {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    const { data, isLoading } = useQuery({
        queryKey: QUERY_KEYS.CUSTOMER.RETURNS.BY_ID(id!),
        queryFn: () => returnService.getReturnById(id!),
        enabled: isAuthenticated && !!id,
        staleTime: 60_000,
    });

    return { returnRecord: data, loading: isLoading };
};
