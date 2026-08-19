import { NotificationData } from "../../types/notification";
import { NotificationHandler } from "./types";
import { ProductOfferNotification } from "../../features/product/notifications/productOfferNotification";
import { OrderTimelineHandler } from "../../features/orders/notifications/orderTimelineNotification";

/**
 * Normalization boundary converting raw payload data fields
 * into a single canonical notification type string format.
 */
export function getCanonicalType(data: NotificationData | undefined): string | null {
  if (!data) return null;

  // Custom marketing layout identifier
  if (data.notificationType === "product_offer") {
    return "PRODUCT_OFFER";
  }

  // Standard FCM type or screen routing key
  const rawType = data.type || data.screen || "";
  return rawType.toUpperCase().trim() || null;
}

// Registry mapping canonical uppercase type strings to feature handlers
const notificationHandlers: Record<string, NotificationHandler> = {
  PRODUCT_OFFER: ProductOfferNotification,
  ORDER_PLACED: OrderTimelineHandler,
  ORDER_CONFIRMED: OrderTimelineHandler,
  ORDER_PACKED: OrderTimelineHandler,
  ORDER_SHIPPED: OrderTimelineHandler,
  OUT_FOR_DELIVERY: OrderTimelineHandler,
  ORDER_DELIVERED: OrderTimelineHandler,
  ORDER_CANCELLED: OrderTimelineHandler,
  RETURN_REQUESTED: OrderTimelineHandler,
  REFUND_INITIATED: OrderTimelineHandler,
  REFUND_COMPLETED: OrderTimelineHandler,
};

/** Resolves the registered handler for the given canonical type */
export const getNotificationHandler = (
  canonicalType?: string | null,
): NotificationHandler | null => {
  if (!canonicalType) return null;
  return notificationHandlers[canonicalType] ?? null;
};
