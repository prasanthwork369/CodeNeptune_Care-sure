import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { walletService } from '../../services/wallet.service';
import { walletApi } from '../../api/wallet.api';
import { QUERY_KEYS } from '@/src/lib/react-query/queryKeys';
import { useAuthStore } from '../../store/authStore';

export const useWalletBalance = () => {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    const { data, isLoading, isRefetching, refetch } = useQuery({
        queryKey: QUERY_KEYS.CUSTOMER.WALLET.BALANCE,
        queryFn: () => walletService.getBalance(),
        enabled: isAuthenticated,
        staleTime: 60_000 * 5,
        retry: 1,
        refetchOnWindowFocus: false,
    });

    return {
        balance: data ?? null,
        loading: isLoading,
        refreshing: isRefetching,
        refetch,
    };
};

export const useAddMoney = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (amount: number) => walletApi.addMoney({ amount }),
        onSuccess: (updatedBalance) => {
            queryClient.setQueryData(QUERY_KEYS.CUSTOMER.WALLET.BALANCE, updatedBalance);
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOMER.WALLET.LOGS({}) });
        },
    });

    return {
        addMoney: (amount: number) => mutation.mutateAsync(amount),
        loading: mutation.isPending,
        error: mutation.error?.message ?? null,
    };
};

export const useWalletLogs = (limit: number = 20, offset: number = 0) => {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    const { data, isLoading, isRefetching, refetch } = useQuery({
        queryKey: QUERY_KEYS.CUSTOMER.WALLET.LOGS({ limit, offset }),
        queryFn: () => walletService.getLogs(limit, offset),
        enabled: isAuthenticated,
        staleTime: 60_000 * 5,
        retry: 1,
        refetchOnWindowFocus: false,
    });

    return {
        logs: data ?? [],
        loading: isLoading,
        refreshing: isRefetching,
        refetch,
    };
};
