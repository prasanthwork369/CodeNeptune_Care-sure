import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { familyMemberService } from '../../services/familyMember.service';
import { FamilyMemberInput } from '../../types/familyMember';
import { QUERY_KEYS } from '@/src/lib/react-query/queryKeys';
import { useAuthStore } from '../../store/authStore';

export const useFamilyMembers = () => {
    const queryClient = useQueryClient();
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    const { data: rawData, isLoading, isRefetching } = useQuery({
        queryKey: QUERY_KEYS.CUSTOMER.MEMBERS,
        queryFn: familyMemberService.getMembers,
        staleTime: 5 * 60_000,
        refetchOnMount: true,
        enabled: isAuthenticated,
    });

    const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOMER.MEMBERS });

    const addMutation = useMutation({
        mutationFn: (payload: FamilyMemberInput) => familyMemberService.addMember(payload),
        onSuccess: invalidate,
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: Partial<FamilyMemberInput> }) =>
            familyMemberService.updateMember(id, payload),
        onSuccess: invalidate,
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => familyMemberService.deleteMember(id),
        onSuccess: invalidate,
    });

    const members = (rawData ?? []).filter(Boolean);

    return {
        members,
        loading: isLoading,
        refreshing: isRefetching,
        submitting: addMutation.isPending || updateMutation.isPending,
        error: (addMutation.error ?? updateMutation.error ?? deleteMutation.error)?.message ?? null,
        addMember: (payload: FamilyMemberInput) => addMutation.mutateAsync(payload),
        updateMember: (id: string, payload: Partial<FamilyMemberInput>) => updateMutation.mutateAsync({ id, payload }),
        deleteMember: (id: string) => deleteMutation.mutateAsync(id),
    };
};
