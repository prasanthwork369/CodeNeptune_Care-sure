export enum NotificationType {
  ORDER_PLACED = 'ORDER_PLACED',
  ORDER_CONFIRMED = 'ORDER_CONFIRMED',
  ORDER_PACKED = 'ORDER_PACKED',
  ORDER_SHIPPED = 'ORDER_SHIPPED',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  ORDER_DELIVERED = 'ORDER_DELIVERED',
  ORDER_CANCELLED = 'ORDER_CANCELLED',
  RETURN_REQUESTED = 'RETURN_REQUESTED',
  REFUND_INITIATED = 'REFUND_INITIATED',
  REFUND_COMPLETED = 'REFUND_COMPLETED',
  PRESCRIPTION_UPLOADED = 'PRESCRIPTION_UPLOADED',
  PRESCRIPTION_APPROVED = 'PRESCRIPTION_APPROVED',
  PRESCRIPTION_REJECTED = 'PRESCRIPTION_REJECTED',
  PRODUCT = 'PRODUCT',
  PRODUCT_BACK_IN_STOCK = 'PRODUCT_BACK_IN_STOCK',
  PRICE_DROP = 'PRICE_DROP',
  CATEGORY = 'CATEGORY',
  OFFER = 'OFFER',
  COUPON = 'COUPON',
  CART_REMINDER = 'CART_REMINDER',
  WISHLIST = 'WISHLIST',
  MEDICINE_REMINDER = 'MEDICINE_REMINDER',
  LAB_REPORT_READY = 'LAB_REPORT_READY',
  APPOINTMENT_REMINDER = 'APPOINTMENT_REMINDER',
  CHAT = 'CHAT',
  WALLET = 'WALLET',
  LOYALTY_POINTS = 'LOYALTY_POINTS',
  PROFILE_VERIFICATION = 'PROFILE_VERIFICATION',
  KYC_REQUIRED = 'KYC_REQUIRED',
  APP_UPDATE = 'APP_UPDATE',
  ANNOUNCEMENT = 'ANNOUNCEMENT',
  HOME = 'HOME',
  NOTIFICATIONS = 'NOTIFICATIONS',
}

/**
 * The `data` block of a push notification. FCM data payloads are always
 * string key/values, so every field is a string. Fields listed explicitly are
 * the ones the app reads; the index signature covers anything else the backend
 * sends (including the nested `data` JSON string we parse on receipt).
 */
export interface NotificationData {
  type?: string;
  screen?: string;
  orderId?: string;
  prescriptionId?: string;
  productId?: string;
  categoryId?: string;
  id?: string;
  status?: string;
  imageUrls?: string;
  /** A nested JSON string of extra params, parsed and merged on receipt. */
  data?: string;
  [key: string]: string | undefined;
}

export interface NotificationPayload {
  type: NotificationType;
  id?: string;
  data?: NotificationData;
}

/**
 * Data block of a marketing product-offer push rendered with the custom
 * native RemoteViews layout. All values are strings (FCM data contract);
 * optional fields hide their views in the layout.
 */
export interface ProductOfferNotificationData {
  notificationType: "product_offer";
  productId: string;
  title: string;
  deepLink: string;
  mrp?: string;
  offerPrice?: string;
  discountText?: string;
  couponText?: string;
  imageUrl?: string;
  buttonText?: string;
}
