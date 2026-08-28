import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { inAppNotificationApi } from "@/src/features/notifications/api/in-app-notification.api";
import { QUERY_KEYS } from "@/src/lib/react-query/queryKeys";
import { useAuthStore } from "@/src/store/authStore";
import { useNotificationStore } from "@/src/store/notificationStore";

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
  const rawUnreadCount = notifications.filter((n) => !n.isRead).length;

  const syncUnreadCount = useNotificationStore((s) => s.syncUnreadCount);
  const unreadCount = useNotificationStore((s) => s.displayedUnreadCount);

  // Background refetches (socket invalidation, staleTime expiry) may only
  // raise the displayed badge — see notificationStore.syncUnreadCount.
  useEffect(() => {
    syncUnreadCount(rawUnreadCount);
  }, [rawUnreadCount, syncUnreadCount]);

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
