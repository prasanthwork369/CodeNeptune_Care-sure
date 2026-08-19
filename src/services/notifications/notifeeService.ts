import type { EventDetail } from "@notifee/react-native";
import { NOTIFICATION_CHANNELS } from "../../constants/notification-channels";
import { NotificationData } from "../../types/notification";
import { isExpoGo } from "../../utils/environment";
import { handleNotificationAction } from "./notificationActions";

// Configured brand assets for Android notification icon templates
const BRAND_COLOR = "#FFFFFF";
const SMALL_ICON = "notification_icon";
const LARGE_ICON = require("../../../assets/images/notification-tile.png");

// Lazy-load notifee only outside Expo Go environment
const getNotifee = () => require("@notifee/react-native");

type RemoteLike = {
  notification?: {
    title?: string;
    body?: string;
    android?: { channelId?: string };
  };
  data?: Record<string, unknown>;
};

// Idempotent Android-only channel registration
let channelsReady = false;
async function ensureChannels(): Promise<void> {
  if (channelsReady) return;
  const notifee = getNotifee().default;
  const { AndroidImportance } = getNotifee();
  await notifee.createChannel({
    id: NOTIFICATION_CHANNELS.ORDERS,
    name: "Order Updates",
    importance: AndroidImportance.HIGH,
  });
  await notifee.createChannel({
    id: NOTIFICATION_CHANNELS.REMINDERS,
    name: "Reminders",
    importance: AndroidImportance.HIGH,
  });
  await notifee.createChannel({
    id: NOTIFICATION_CHANNELS.OFFERS,
    name: "Offers & Promotions",
    importance: AndroidImportance.DEFAULT,
  });
  channelsReady = true;
}

export const notifeeService = {
  /** Displays custom branded notifications via Notifee */
  displayBranded: async (remoteMessage: RemoteLike): Promise<void> => {
    if (isExpoGo) return;
    const notifee = getNotifee().default;
    const { AndroidStyle } = getNotifee();
    await ensureChannels();

    const data = (remoteMessage.data ?? {}) as NotificationData;
    const channelId =
      data.channelId ||
      remoteMessage.notification?.android?.channelId ||
      NOTIFICATION_CHANNELS.ORDERS;
    const title =
      remoteMessage.notification?.title ?? data.title ?? "Notification";
    const body = remoteMessage.notification?.body ?? data.body ?? "";

    await notifee.displayNotification({
      title,
      body,
      data,
      android: {
        channelId,
        smallIcon: SMALL_ICON,
        largeIcon: LARGE_ICON,
        color: BRAND_COLOR,
        // Expandable BigText style for full body text
        style: { type: AndroidStyle.BIGTEXT, text: body },
        pressAction: { id: "default" },
      },
    });
  },

  /** Retrieves the tap event data that cold-started the app */
  getInitialTap: async (): Promise<{
    data: NotificationData;
    tapId: string;
  } | null> => {
    if (isExpoGo) return null;
    const notifee = getNotifee().default;
    const initial = await notifee.getInitialNotification();
    if (!initial?.notification) return null;
    const data = (initial.notification.data ?? {}) as NotificationData;
    const tapId =
      data["google.message_id"] ||
      initial.notification.id ||
      String(Date.now());
    return { data, tapId };
  },

  /** Registers foreground notification tap listeners */
  addForegroundPressListener: (
    onPress: (data: NotificationData, tapId: string) => void,
  ): (() => void) => {
    if (isExpoGo) return () => {};
    const notifee = getNotifee().default;
    const { EventType } = getNotifee();
    return notifee.onForegroundEvent(
      ({ type, detail }: { type: number; detail: EventDetail }) => {
        const n = detail.notification;
        if (!n) return;

        // Route default press actions like a standard tap
        if (type === EventType.ACTION_PRESS) {
          const actionId = detail.pressAction?.id;
          if (actionId && actionId !== "default") {
            handleNotificationAction(actionId, n.id, n.data);
            return;
          }
        } else if (type !== EventType.PRESS) {
          return;
        }

        const data = (n.data ?? {}) as NotificationData;
        const tapId = data["google.message_id"] || n.id || String(Date.now());
        onPress(data, tapId);
      },
    );
  },
};
