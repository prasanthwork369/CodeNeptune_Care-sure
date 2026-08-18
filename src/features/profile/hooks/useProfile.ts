import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { profileApi } from "@/src/features/profile/api/profile.api";
import type {
  CustomerProfile,
  UpdateProfilePayload,
} from "@/src/features/profile/types";
import { apiClient } from "@/src/api/client";
import { QUERY_KEYS } from "@/src/lib/react-query/queryKeys";
import { useCachedSeed, withSqliteCache } from "@/src/lib/sqlite/cache";
import { API_ENDPOINTS } from "@/src/utils/urls";
import { useAuthStore } from "@/src/store/authStore";

export const useProfile = () => {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setUser = useAuthStore((s) => s.setUser);
  const cachedProfile = useCachedSeed<CustomerProfile>("customer_profile");

  const {
    data: profile,
    isLoading,
    isRefetching,
  } = useQuery({
    queryKey: QUERY_KEYS.CUSTOMER.PROFILE,
    queryFn: withSqliteCache("customer_profile", profileApi.getProfile),
    initialData: () => cachedProfile?.data,
    initialDataUpdatedAt: () => cachedProfile?.updatedAt ?? 0,
    staleTime: 2 * 60_000,
    enabled: isAuthenticated,
  });

  // Keep authStore user state synchronized with fresh profile query data.
  useEffect(() => {
    if (profile) {
      setUser(profile);
    }
  }, [profile, setUser]);

  const updateMutation = useMutation({
    mutationFn: profileApi.updateProfile,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOMER.PROFILE }),
  });

  const updateProfile = (payload: UpdateProfilePayload) =>
    updateMutation.mutateAsync(payload);

  // Covers both steps below (file upload + profile URL save), not just the
  // update mutation — uploadAvatar calls apiClient/profileApi directly, so
  // updateMutation.isPending alone never reflects the actual upload.
  const [avatarUploading, setAvatarUploading] = useState(false);

  const uploadAvatar = async (uri: string) => {
    setAvatarUploading(true);
    try {
      const filename = uri.split("/").pop() ?? "avatar.jpg";
      const ext = filename.split(".").pop()?.toLowerCase() ?? "jpg";
      const type =
        ext === "png"
          ? "image/png"
          : ext === "webp"
            ? "image/webp"
            : "image/jpeg";

      // Step 1 — upload file, get back a URL
      const form = new FormData();
      form.append("file", { uri, name: filename, type } as unknown as Blob);

      const uploadRes = await apiClient.post(
        API_ENDPOINTS.STORAGE_UPLOAD,
        form,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      const avatarUrl: string =
        uploadRes.data?.data?.url ?? uploadRes.data?.url;
      if (!avatarUrl) throw new Error("Upload failed — no URL returned");

      // Step 2 — save URL to profile
      await profileApi.updateProfile({ avatarUrl });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOMER.PROFILE });
    } finally {
      setAvatarUploading(false);
    }
  };

  const refreshProfile = () =>
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOMER.PROFILE });

  return {
    profile,
    loading: isLoading,
    refreshing: isRefetching,
    updating: updateMutation.isPending,
    avatarUploading,
    error: updateMutation.error?.message ?? null,
    refreshProfile,
    updateProfile,
    uploadAvatar,
  };
};
