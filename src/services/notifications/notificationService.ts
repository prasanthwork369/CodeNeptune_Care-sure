import { notifeeService } from "./notifeeService";
import { getCanonicalType, getNotificationHandler } from "./registry";
import { NotificationData } from "../../types/notification";

type RemoteMessageLike = {
  notification?: {
    title?: string;
    body?: string;
    android?: { channelId?: string };
  };
  data?: Record<string, unknown>;
};

export const notificationService = {
  /**
   * Primary entry point for displaying incoming foreground or background FCM notifications.
   * Leverages the registry to look up handlers and falls back to standard branded notifications.
   */
  handleIncomingMessage: async (remoteMessage: RemoteMessageLike): Promise<void> => {
    const data = (remoteMessage.data ?? {}) as NotificationData;
    const canonicalType = getCanonicalType(data);
    const handler = getNotificationHandler(canonicalType);

    if (handler) {
      const shown = await handler.display(data).catch(() => false);
      if (shown) {
        return;
      }
    }

    // Fallback to standard branded notification
    await notifeeService.displayBranded(remoteMessage).catch(() => {});
  },
};
