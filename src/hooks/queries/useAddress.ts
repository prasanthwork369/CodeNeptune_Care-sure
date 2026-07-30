import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addressApi,
  CreateAddressPayload,
  UpdateAddressPayload,
} from "../../api/address.api";
import { QUERY_KEYS } from "@/src/lib/react-query/queryKeys";
import { useAuthStore } from "../../store/authStore";

export const useAddress = () => {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const {
    data: addresses = [],
    isLoading,
    isRefetching,
    isSuccess,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.CUSTOMER.ADDRESSES,
    queryFn: addressApi.getAddresses,
    staleTime: 5 * 60_000,
    refetchOnMount: false,
    enabled: isAuthenticated,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOMER.ADDRESSES });

  const addMutation = useMutation({
    mutationFn: (payload: CreateAddressPayload) =>
      addressApi.addAddress(payload),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateAddressPayload) =>
      addressApi.updateAddress(payload),
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
    /**
     * True only once the list has actually come back from the API. An empty
     * `addresses` means "still loading" or "the fetch failed" until this is
     * true, so callers must not treat [] as "the user has no addresses".
     */
    loaded: isSuccess,
    refreshing: isRefetching,
    submitting: addMutation.isPending || updateMutation.isPending,
    deleting: deleteMutation.variables ?? null,
    error:
      (addMutation.error ?? updateMutation.error ?? deleteMutation.error)
        ?.message ?? null,
    addAddress: (payload: CreateAddressPayload) =>
      addMutation.mutateAsync(payload),
    updateAddress: (payload: UpdateAddressPayload) =>
      updateMutation.mutateAsync(payload),
    deleteAddress: (id: string) => deleteMutation.mutateAsync(id),
    refetch: refetchSafe,
  };
};
