import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Address } from "@/src/types/address";
import { addressApi } from "@/src/features/profile/api/address.api";
import type {
  CreateAddressPayload,
  UpdateAddressPayload,
} from "@/src/features/profile/types";
import { QUERY_KEYS } from "@/src/lib/react-query/queryKeys";
import { useAuthStore } from "@/src/store/authStore";
import { useCachedSeed, withSqliteCache } from "@/src/lib/sqlite/cache";

export const useAddress = () => {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const cachedAddresses = useCachedSeed<Address[]>("customer_addresses");

  const {
    data: addresses = [],
    isLoading,
    isRefetching,
    isSuccess,
    refetch,
  } = useQuery<Address[]>({
    queryKey: QUERY_KEYS.CUSTOMER.ADDRESSES,
    queryFn: withSqliteCache("customer_addresses", addressApi.getAddresses),
    // placeholderData, not initialData: this hook sets refetchOnMount: false,
    // and initialData would mark the query "already fetched", which combined
    // with refetchOnMount: false would skip the real network call entirely on
    // a cold start. placeholderData never does that, and it also keeps
    // isSuccess/loaded false until the real fetch lands — useDeliveryAddress
    // depends on that timing to avoid guessing "no saved address" too early.
    placeholderData: () => cachedAddresses?.data,
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
    return Promise.resolve(null);
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
