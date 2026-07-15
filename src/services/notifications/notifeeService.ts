import { NOTIFICATION_CHANNELS } from "../../constants/notificationChannels";
import { NotificationData } from "../../types/notification";
import { isExpoGo } from "../../utils/environment";
import { handleNotificationAction } from "./notificationActions";

// CareSure branded notification visuals. `notification_icon` is the white
// silhouette drawable the expo-notifications plugin generates from
// notification-icon.png; the large icon is the full-colour logo.
const BRAND_COLOR = "#0F7635";
const SMALL_ICON = "notification_icon";
// Large icon = the filled green-gradient tile (white logo on a gradient), so it
// reads big and branded in the shade like other apps' notifications, rather than
// a small floating mark.
const LARGE_ICON = require("../../../assets/images/notification-tile.png");

// notifee is a native module (absent in Expo Go) — lazy-require after the guard,
// mirroring how firebase messaging is loaded elsewhere.
const getNotifee = () => require("@notifee/react-native");

type RemoteLike = {
  notification?: {
    title?: string;
    body?: string;
    android?: { channelId?: string };
  };
  data?: Record<string, unknown>;
};

// Channels are Android-only and idempotent; create once per session.
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
  /**
   * Displays an FCM message via notifee with the CareSure branded large + small
   * icons — the only way to get a full-colour logo in the notification on every
   * Android version/skin (expo-notifications / OS-display can't set a large icon).
   */
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
        // BigText style makes the notification expandable (shows the chevron)
        // and reveals the full message instead of a single truncated line.
        style: { type: AndroidStyle.BIGTEXT, text: body },
        // A press action makes the whole notification tappable and delivers a
        // PRESS event we can route on.
        pressAction: { id: "default" },
      },
    });
  },

  /**
   * Cold-start tap: the app was killed and launched by tapping a notifee
   * notification. Returns the tap data + a de-dup id, or null. (OS-displayed FCM
   * notifications are handled by messaging().getInitialNotification instead.)
   */
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
      data["google.message_id"] || initial.notification.id || String(Date.now());
    return { data, tapId };
  },

  /**
   * Registers a foreground tap listener for notifee-displayed notifications.
   * Returns an unsubscribe function. (Background/killed taps route through the
   * existing Firebase handlers.)
   */
  addForegroundPressListener: (
    onPress: (data: NotificationData, tapId: string) => void,
  ): (() => void) => {
    if (isExpoGo) return () => {};
    const notifee = getNotifee().default;
    const { EventType } = getNotifee();
    return notifee.onForegroundEvent(
      ({
        type,
        detail,
      }: {
        type: number;
        detail: { notification?: any; pressAction?: { id: string } };
      }) => {
        const n = detail.notification;
        if (!n) return;

        // A button whose pressAction is "default" means "open the app here" —
        // route it like a tap. Any other id is a real action.
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
        const tapId =
          data["google.message_id"] || n.id || String(Date.now());
        onPress(data, tapId);
      },
    );
  },
};
