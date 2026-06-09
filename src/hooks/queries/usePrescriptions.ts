import { useQuery } from '@tanstack/react-query';
import { prescriptionService } from '../../services/prescription.service';
import { QUERY_KEYS } from '@/src/lib/react-query/queryKeys';
import { useAuthStore } from '../../store/authStore';

interface UsePrescriptionsParams {
    page?: number;
    limit?: number;
    status?: number;
    excludeStatus?: number;
    sortOrder?: 'asc' | 'desc';
    category?: number;
    refetchInterval?: number | false;
}

export const usePrescriptions = (params: UsePrescriptionsParams = {}) => {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const { refetchInterval, ...queryParams } = params;

    const { data, isLoading, isRefetching, refetch } = useQuery({
        queryKey: QUERY_KEYS.CUSTOMER.PRESCRIPTIONS.LIST(queryParams),
        queryFn: () => prescriptionService.list(queryParams),
        enabled: isAuthenticated,
        staleTime: 60_000,
        retry: 1,
        refetchOnWindowFocus: false,
        refetchInterval: refetchInterval ?? false,
    });

    return {
        prescriptions: data?.data ?? [],
        loading: isLoading,
        refreshing: isRefetching,
        refetch,
    };
};
