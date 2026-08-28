import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inAppNotificationApi } from "@/src/features/notifications/api/in-app-notification.api";
import { QUERY_KEYS } from "@/src/lib/react-query/queryKeys";
import { useNotificationStore } from "@/src/store/notificationStore";

export const useDismissNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => inAppNotificationApi.dismiss(id),
    onSuccess: () => {
      // Explicit user action — the next unread-count sync may drop.
      useNotificationStore.getState().permitUnreadCountDecrease();
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CUSTOMER.NOTIFICATIONS,
      });
    },
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => inAppNotificationApi.markRead(id),
    onSuccess: () => {
      useNotificationStore.getState().permitUnreadCountDecrease();
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CUSTOMER.NOTIFICATIONS,
      });
    },
  });
};

export const useDismissAllNotifications = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => inAppNotificationApi.dismissAll(),
    onSuccess: () => {
      useNotificationStore.getState().permitUnreadCountDecrease();
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CUSTOMER.NOTIFICATIONS,
      });
    },
  });
};
