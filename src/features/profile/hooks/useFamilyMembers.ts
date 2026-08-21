import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { familyMemberApi } from "@/src/features/profile/api/family-member.api";
import type {
  FamilyMember,
  FamilyMemberInput,
} from "@/src/features/profile/types";
import { QUERY_KEYS } from "@/src/lib/react-query/queryKeys";
import { useAuthStore } from "@/src/store/authStore";
import { useCachedSeed, withSqliteCache } from "@/src/lib/sqlite/cache";

export const useFamilyMembers = () => {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const cachedMembers = useCachedSeed<FamilyMember[]>("family_members");

  const {
    data: rawData,
    isLoading,
    isRefetching,
    error: listError,
    refetch,
  } = useQuery<FamilyMember[]>({
    queryKey: QUERY_KEYS.CUSTOMER.MEMBERS,
    queryFn: withSqliteCache("family_members", familyMemberApi.getMembers),
    initialData: () => cachedMembers?.data,
    initialDataUpdatedAt: () => cachedMembers?.updatedAt ?? 0,
    staleTime: 5 * 60_000,
    refetchOnMount: true,
    enabled: isAuthenticated,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOMER.MEMBERS });

  const addMutation = useMutation({
    mutationFn: (payload: FamilyMemberInput) =>
      familyMemberApi.addMember(payload),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<FamilyMemberInput>;
    }) => familyMemberApi.updateMember(id, payload),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => familyMemberApi.deleteMember(id),
    onSuccess: invalidate,
  });

  const members = (rawData ?? []).filter(Boolean);

  return {
    members,
    loading: isLoading,
    refreshing: isRefetching,
    submitting: addMutation.isPending || updateMutation.isPending,
    error:
      (addMutation.error ?? updateMutation.error ?? deleteMutation.error)
        ?.message ?? null,
    /**
     * The list fetch's own failure, kept separate from the mutation `error`
     * string above: an empty `members` after this is set means the list could
     * not be read, not that the account has no patients.
     */
    listError,
    refetch,
    addMember: (payload: FamilyMemberInput) => addMutation.mutateAsync(payload),
    updateMember: (id: string, payload: Partial<FamilyMemberInput>) =>
      updateMutation.mutateAsync({ id, payload }),
    deleteMember: (id: string) => deleteMutation.mutateAsync(id),
  };
};
