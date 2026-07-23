import { displayProductOfferNotification } from "../../modules/ProductOfferNotification";
import {
  NotificationData,
  ProductOfferNotificationData,
} from "../../types/notification";

/** True when an FCM data block is a marketing product-offer push. */
export const isProductOffer = (
  data: NotificationData | undefined,
): boolean => data?.notificationType === "product_offer";

/** Builds the native payload, or null when required fields are missing. */
const toProductOfferData = (
  data: NotificationData,
): ProductOfferNotificationData | null => {
  const { productId, title } = data;
  if (!productId || !title) return null;
  return {
    notificationType: "product_offer",
    productId,
    title,
    // Default deep link derived from productId so the backend may omit it.
    deepLink: data.deepLink || `caresure://product/${productId}`,
    mrp: data.mrp,
    offerPrice: data.offerPrice,
    discountText: data.discountText,
    couponText: data.couponText,
    imageUrl: data.imageUrl,
    buttonText: data.buttonText,
    subText: data.subText,
  };
};

/**
 * Shows the custom RemoteViews product-offer notification. Returns true when
 * the native layer displayed it; false means the caller must fall back to the
 * standard branded notification so the push is never silently dropped.
 */
export const showProductOffer = async (
  data: NotificationData | undefined,
): Promise<boolean> => {
  if (!data || !isProductOffer(data)) return false;
  const payload = toProductOfferData(data);
  if (!payload) return false;
  try {
    return await displayProductOfferNotification(payload);
  } catch {
    return false;
  }
};
