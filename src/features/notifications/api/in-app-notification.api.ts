import { API_ENDPOINTS } from "@/src/utils/urls";
import { apiClient } from "@/src/api/client";
import type { PaginatedNotifications } from "../types/api.types";

export const inAppNotificationApi = {
  list: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedNotifications> => {
    const { data } = await apiClient.get(API_ENDPOINTS.NOTIFICATIONS, {
      params,
    });
    return data.data;
  },
  markRead: async (id: string): Promise<void> => {
    await apiClient.patch(API_ENDPOINTS.NOTIFICATION_MARK_READ(id));
  },
  dismiss: async (id: string): Promise<void> => {
    await apiClient.patch(API_ENDPOINTS.NOTIFICATION_DISMISS(id));
  },
  dismissAll: async (): Promise<void> => {
    await apiClient.patch(API_ENDPOINTS.NOTIFICATIONS_DISMISS_ALL);
  },
};
