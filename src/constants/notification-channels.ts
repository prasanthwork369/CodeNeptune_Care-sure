/**
 * Android notification channel IDs — the single source of truth.
 *
 * The app creates these channels (see notification.service.ts) and the backend
 * must send each push with a matching `channel_id`. Keep the string values in
 * sync with the backend; changing a value here means updating the backend too.
 */
export const NOTIFICATION_CHANNELS = {
  ORDERS: "orders",
  REMINDERS: "reminders",
  OFFERS: "offers",
} as const;

export type NotificationChannelId =
  (typeof NOTIFICATION_CHANNELS)[keyof typeof NOTIFICATION_CHANNELS];
