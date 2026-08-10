import { API_ENDPOINTS } from "../utils/urls";
import { apiClient } from "./client";

/** Event-specific payload; the listed keys are the ones the UI reads. */
export interface NotificationMetadata {
  type?: string;
  coinsAmount?: number | string;
  walletAmount?: number | string;
  orderId?: string;
  prescriptionId?: string;
  prescriptionOrderId?: string;
  [key: string]: unknown;
}

export interface NotificationLog {
  id: string;
  templateId: string | null;
  recipientId: string;
  recipientType: string;
  recipientEmail: string | null;
  recipientPhone: string | null;
  channel: "EMAIL" | "SMS" | "PUSH" | "IN_APP";
  event: string;
  subject: string | null;
  body: string;
  status: "SENT" | "FAILED" | "DELIVERED";
  triggeredBy: string | null;
  orderId: string | null;
  metadata: NotificationMetadata;
  isRead: boolean;
  readAt: string | null;
  isDismissed: boolean;
  dismissedAt: string | null;
  createdAt: string;
}

export interface PaginatedNotifications {
  items: NotificationLog[];
  total: number;
  page: number;
  limit: number;
}

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
