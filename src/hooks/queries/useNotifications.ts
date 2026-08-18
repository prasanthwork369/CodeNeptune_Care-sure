import { useQuery } from "@tanstack/react-query";
import { inAppNotificationApi } from "@/src/features/notifications/api/in-app-notification.api";
import { QUERY_KEYS } from "@/src/lib/react-query/queryKeys";
import { useAuthStore } from "../../store/authStore";

export const useNotifications = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const { data, isLoading, isRefetching, isError, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.CUSTOMER.NOTIFICATIONS,
    queryFn: () => inAppNotificationApi.list({ limit: 50 }),
    enabled: isAuthenticated,
    staleTime: 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const notifications = data?.items ?? [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    isRefetching,
    isError,
    error,
    refetch,
  };
};
