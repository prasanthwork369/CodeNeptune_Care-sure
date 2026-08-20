import { displayRichCampaignNotification } from "../../../modules/RichCampaignNotification";
import {
  NotificationData,
  RichCampaignNotificationData,
} from "../../../types/notification";
import {
  NotificationHandler,
  NotificationDestination,
} from "../types";

/**
 * Identifies whether an incoming FCM payload is a rich campaign notification.
 */
export const isRichCampaign = (data: NotificationData | undefined): boolean => {
  if (!data) return false;
  const type = (data.type || data.notificationType || "").toUpperCase().trim();
  return (
    type === "RICH_CAMPAIGN" ||
    type === "PROMOTION" ||
    type === "OFFER" ||
    type === "CAMPAIGN" ||
    type === "REORDER" ||
    type === "CART_REMINDER" ||
    data.notificationType === "rich_campaign"
  );
};

/**
 * Normalizes raw FCM string data into RichCampaignNotificationData.
 */
export const toRichCampaignData = (
  data: NotificationData,
): RichCampaignNotificationData | null => {
  const title = data.title || data.headline;
  if (!title) return null;

  // Resolve deep link from payload, falling back to a route that actually
  // exists — "/offers" has no screen and would land the OS-level tap (which
  // bypasses NotificationNavigation entirely) on Expo Router's not-found page.
  const deepLink =
    data.deepLink ||
    (data.route ? `caresure://${data.route.replace(/^\//, "")}` : undefined) ||
    (data.productId
      ? `caresure://product/${data.productId}`
      : "caresure://notifications");

  const expiresAt =
    typeof data.expiresAt === "number"
      ? data.expiresAt
      : data.expiresAt
        ? Number(data.expiresAt)
        : undefined;

  return {
    notificationType: "rich_campaign",
    notificationId: data.notificationId || data.id,
    title,
    body: data.body || data.description || "",
    imageUrl: data.imageUrl || data.image,
    expiresAt,
    actionLabel: data.actionLabel || data.buttonText || "Check Now",
    deepLink,
    campaignId: data.campaignId,
    subText: data.subText,
  };
};

export const RichCampaignHandler: NotificationHandler = {
  /**
   * Displays the custom Apollo-style notification via native RemoteViews.
   * Returns true on success, false on failure (triggering fallback).
   */
  display: async (data: NotificationData): Promise<boolean> => {
    const payload = toRichCampaignData(data);
    if (!payload) return false;
    try {
      return await displayRichCampaignNotification(payload);
    } catch {
      return false;
    }
  },

  getTapDestination: (data: NotificationData): NotificationDestination | null => {
    if (data.productId) {
      return {
        pathname: "/product/[id]",
        params: { id: data.productId },
      };
    }
    if (data.categoryId) {
      return {
        pathname: "/category/[id]",
        params: { id: data.categoryId },
      };
    }
    if (data.route) {
      return {
        pathname: data.route,
      };
    }
    // No explicit destination in the payload: return null so
    // NotificationNavigation's own switch-case decides — that's what lets a
    // plain CART_REMINDER (no productId/categoryId/route) fall through to its
    // dedicated cart case instead of being swallowed here. Everything else
    // without a case of its own lands on that switch's default (/notifications).
    return null;
  },
};
