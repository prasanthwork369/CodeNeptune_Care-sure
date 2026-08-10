import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inAppNotificationApi } from "../../api/in-app-notification.api";
import { QUERY_KEYS } from "@/src/lib/react-query/queryKeys";

export const useDismissNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => inAppNotificationApi.dismiss(id),
    onSuccess: () => {
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
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CUSTOMER.NOTIFICATIONS,
      });
    },
  });
};
