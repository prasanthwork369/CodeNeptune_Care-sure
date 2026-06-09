import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addressApi, CreateAddressPayload, UpdateAddressPayload } from '../../api/address.api';
import { QUERY_KEYS } from '@/src/lib/react-query/queryKeys';
import { useAuthStore } from '../../store/authStore';

export const useAddress = () => {
    const queryClient = useQueryClient();
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    const { data: addresses = [], isLoading, isRefetching, refetch } = useQuery({
        queryKey: QUERY_KEYS.CUSTOMER.ADDRESSES,
        queryFn: addressApi.getAddresses,
        staleTime: 5 * 60_000,
        refetchOnMount: false,
        enabled: isAuthenticated,
    });

    const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOMER.ADDRESSES });

    const addMutation = useMutation({
        mutationFn: (payload: CreateAddressPayload) => addressApi.addAddress(payload),
        onSuccess: invalidate,
    });

    const updateMutation = useMutation({
        mutationFn: (payload: UpdateAddressPayload) => addressApi.updateAddress(payload),
        onSuccess: invalidate,
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => addressApi.deleteAddress(id),
        onSuccess: invalidate,
    });

    const refetchSafe = () => {
        if (isAuthenticated) {
            return refetch();
        }
        return Promise.resolve(null) as any;
    };

    return {
        addresses,
        loading: isLoading,
        refreshing: isRefetching,
        submitting: addMutation.isPending || updateMutation.isPending,
        deleting: deleteMutation.variables ?? null,
        error: (addMutation.error ?? updateMutation.error ?? deleteMutation.error)?.message ?? null,
        addAddress: (payload: CreateAddressPayload) => addMutation.mutateAsync(payload),
        updateAddress: (payload: UpdateAddressPayload) => updateMutation.mutateAsync(payload),
        deleteAddress: (id: string) => deleteMutation.mutateAsync(id),
        refetch: refetchSafe,
    };
};
