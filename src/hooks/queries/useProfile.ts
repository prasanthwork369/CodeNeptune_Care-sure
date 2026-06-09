import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { profileApi, UpdateProfilePayload } from '../../api/profile.api';
import { apiClient } from '../../api/client';
import { QUERY_KEYS } from '@/src/lib/react-query/queryKeys';
import { API_ENDPOINTS } from '../../utils/urls';
import { useAuthStore } from '../../store/authStore';

export const useProfile = () => {
    const queryClient = useQueryClient();
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    const { data: profile, isLoading, isRefetching } = useQuery({
        queryKey: QUERY_KEYS.CUSTOMER.PROFILE,
        queryFn: profileApi.getProfile,
        staleTime: 0,
        refetchOnMount: true,
        enabled: isAuthenticated,
    });

    const updateMutation = useMutation({
        mutationFn: profileApi.updateProfile,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOMER.PROFILE }),
    });

    const updateProfile = (payload: UpdateProfilePayload) => updateMutation.mutateAsync(payload);
    
    const uploadAvatar = async (uri: string) => {
        const filename = uri.split('/').pop() ?? 'avatar.jpg';
        const ext = filename.split('.').pop()?.toLowerCase() ?? 'jpg';
        const type = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

        // Step 1 — upload file, get back a URL
        const form = new FormData();
        form.append('file', { uri, name: filename, type } as any);

        const uploadRes = await apiClient.post(API_ENDPOINTS.STORAGE_UPLOAD, form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        const avatarUrl: string = uploadRes.data?.data?.url ?? uploadRes.data?.url;
        if (!avatarUrl) throw new Error('Upload failed — no URL returned');

        // Step 2 — save URL to profile
        await profileApi.updateProfile({ avatarUrl });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOMER.PROFILE });
    };

    const refreshProfile = () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOMER.PROFILE });

    return {
        profile,
        loading: isLoading,
        refreshing: isRefetching,
        updating: updateMutation.isPending,
        avatarUploading: updateMutation.isPending,
        error: updateMutation.error?.message ?? null,
        refreshProfile,
        updateProfile,
        uploadAvatar,
    };
};
