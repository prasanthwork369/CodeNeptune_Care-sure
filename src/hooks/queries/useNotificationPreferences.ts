import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  notificationPreferencesApi,
  UpdateNotificationPreferencesInput,
} from "@/src/api/notification-preferences.api";
import { QUERY_KEYS } from "@/src/lib/react-query/queryKeys";
import { useAuthStore } from "@/src/store/authStore";

export const useNotificationPreferences = () => {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const { data: preferences, isLoading } = useQuery({
    queryKey: QUERY_KEYS.CUSTOMER.NOTIFICATION_PREFERENCES,
    queryFn: notificationPreferencesApi.getPreferences,
    enabled: isAuthenticated,
    staleTime: 0,
    refetchOnMount: true,
  });

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateNotificationPreferencesInput) =>
      notificationPreferencesApi.updatePreferences(payload),
    onMutate: async (payload) => {
      const previous = queryClient.getQueryData(
        QUERY_KEYS.CUSTOMER.NOTIFICATION_PREFERENCES,
      );
      queryClient.setQueryData(
        QUERY_KEYS.CUSTOMER.NOTIFICATION_PREFERENCES,
        (old: any) => ({ ...old, ...payload }),
      );
      return { previous };
    },
    onError: (_err, _payload, context: any) => {
      if (context?.previous)
        queryClient.setQueryData(
          QUERY_KEYS.CUSTOMER.NOTIFICATION_PREFERENCES,
          context.previous,
        );
    },
    onSuccess: (updated) =>
      queryClient.setQueryData(
        QUERY_KEYS.CUSTOMER.NOTIFICATION_PREFERENCES,
        updated,
      ),
  });

  return {
    preferences,
    isLoading,
    updating: updateMutation.isPending,
    updatePreferences: (payload: UpdateNotificationPreferencesInput) =>
      updateMutation.mutateAsync(payload),
  };
};
