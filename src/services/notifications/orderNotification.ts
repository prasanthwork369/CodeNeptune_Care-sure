import { NOTIFICATION_CHANNELS } from "../../constants/notificationChannels";
import { NotificationType } from "../../types/notification";
import { isExpoGo } from "../../utils/environment";
import { NOTIFICATION_ACTIONS } from "./notificationActions";

// Same branded visuals as notifeeService so local and push notifications match.
const BRAND_COLOR = "#FFFFFF";
const SMALL_ICON = "notification_icon";
const LARGE_ICON = require("../../../assets/images/notification-tile.png");

const getNotifee = () => require("@notifee/react-native");

// "Fri, 18 Jul" — a weekday reads as a promise; a bare date reads as a record.
const formatDeliveryDate = (iso?: string): string => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
};

export interface OrderPlacedInput {
  orderId: string;
  /** ISO date; the arrival line is dropped when absent. */
  estimatedDelivery?: string;
  /** First item's image — shown in the expanded view when present. */
  imageUrl?: string;
  itemCount?: number;
}

export const orderNotification = {
  /**
   * Local confirmation shown right after an order is placed. `type` +
   * `orderId` are what NotificationNavigation routes on, so tapping it opens
   * the tracking screen — the same path a backend push would take.
   */
  showOrderPlaced: async (input: OrderPlacedInput): Promise<void> => {
    if (isExpoGo) return;
    const notifee = getNotifee().default;
    const { AndroidStyle } = getNotifee();

    const arriving = formatDeliveryDate(input.estimatedDelivery);
    const items = input.itemCount
      ? `${input.itemCount} item${input.itemCount > 1 ? "s" : ""}`
      : "Your order";

    // Lead with what the customer wants to know — when it arrives. The order
    // number is already on the screen they came from.
    const body = arriving
      ? `${items} arriving ${arriving}. We'll let you know when it's on the way.`
      : `${items} confirmed. We'll update you as it moves.`;

    await notifee.displayNotification({
      id: `order-placed-${input.orderId}`,
      title: "Order confirmed 🎉",
      body,
      // No orderId on purpose: NotificationNavigation deep-links to the tracking
      // screen when it has one, and falls back to My Orders when it doesn't —
      // which is where this notification should land.
      data: {
        type: NotificationType.ORDER_PLACED,
      },
      android: {
        channelId: NOTIFICATION_CHANNELS.ORDERS,
        smallIcon: SMALL_ICON,
        largeIcon: LARGE_ICON,
        color: BRAND_COLOR,
        // A product shot when we have one, otherwise the full text.
        style: input.imageUrl
          ? {
              type: AndroidStyle.BIGPICTURE,
              picture: input.imageUrl,
              title: "Order confirmed 🎉",
              summary: body,
            }
          : { type: AndroidStyle.BIGTEXT, text: body },
        pressAction: { id: "default", launchActivity: "default" },
        actions: [
          {
            title: "Track Order",
            // "default" + launchActivity opens the app, then the tap routing
            // takes it to the order — same path as tapping the body.
            pressAction: { id: "default", launchActivity: "default" },
          },
          {
            title: "Call Support",
            pressAction: { id: NOTIFICATION_ACTIONS.CALL },
          },
        ],
      },
    });
  },
};
