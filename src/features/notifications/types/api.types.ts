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

export interface CustomerNotificationPreferences {
  id: string;
  customerId: string;
  // Order Updates is split into two channels (matches the web + API)
  orderUpdatesSmsEnabled: boolean;
  orderUpdatesEmailEnabled: boolean;
  healthUpdatesEnabled: boolean;
  promotionsOffersEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateNotificationPreferencesInput {
  orderUpdatesSmsEnabled?: boolean;
  orderUpdatesEmailEnabled?: boolean;
  healthUpdatesEnabled?: boolean;
  promotionsOffersEnabled?: boolean;
}
