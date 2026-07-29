import { router } from 'expo-router';
import { Linking, Platform } from 'react-native';
import { NotificationPayload, NotificationType } from '../../types/notification';
import { useAuthStore } from '../../store/authStore';
import { useNotificationNavigationStore } from '../../store/notificationNavigationStore';

const ANDROID_PACKAGE = 'com.codeneptune.caresure';

// Sensitive types that strictly require authentication/login
const AUTH_REQUIRED_TYPES = new Set<NotificationType>([
  NotificationType.ORDER_PLACED,
  NotificationType.ORDER_CONFIRMED,
  NotificationType.ORDER_PACKED,
  NotificationType.ORDER_SHIPPED,
  NotificationType.OUT_FOR_DELIVERY,
  NotificationType.ORDER_DELIVERED,
  NotificationType.ORDER_CANCELLED,
  NotificationType.RETURN_REQUESTED,
  NotificationType.REFUND_INITIATED,
  NotificationType.REFUND_COMPLETED,
  NotificationType.PRESCRIPTION_UPLOADED,
  NotificationType.PRESCRIPTION_APPROVED,
  NotificationType.PRESCRIPTION_REJECTED,
  NotificationType.WALLET,
  NotificationType.PROFILE_VERIFICATION,
  NotificationType.KYC_REQUIRED,
  NotificationType.MEDICINE_REMINDER,
  NotificationType.LAB_REPORT_READY,
  NotificationType.APPOINTMENT_REMINDER,
  NotificationType.CHAT,
  NotificationType.WISHLIST,
]);

export const NotificationNavigation = {
  /** Central entrypoint for handling notification tap navigation */
  handleTap: (payload: NotificationPayload, tapId?: string) => {
    if (__DEV__) console.log('[NotificationNavigation] handleTap called with payload:', JSON.stringify(payload, null, 2));

    if (!payload.type) {
      if (__DEV__) console.warn('[NotificationNavigation] Exiting handleTap: No valid notification type found in payload.');
      return;
    }

    // Deduplicate tap events
    const store = useNotificationNavigationStore.getState();
    if (tapId) {
      if (store.lastHandledTapId === tapId) {
        if (__DEV__) console.log('[NotificationNavigation] Skipping duplicate tap event for tapId:', tapId);
        return;
      }
      store.setLastHandledTapId(tapId);
    }

    const { isAuthenticated } = useAuthStore.getState();
    if (__DEV__) console.log(`[NotificationNavigation] User isAuthenticated status: ${isAuthenticated}`);

    // Authentication Guard
    if (AUTH_REQUIRED_TYPES.has(payload.type) && !isAuthenticated) {
      if (__DEV__) console.log(`[NotificationNavigation] Route for type "${payload.type}" requires authentication. Caching and pushing to login.`);
      store.setPendingNotification(payload);
      router.push('/(auth)/login');
      return;
    }

    NotificationNavigation.executeNavigation(payload);
  },

  /** Maps types to Expo Router paths and navigates */
  executeNavigation: (payload: NotificationPayload) => {
    const { type, data = {} } = payload;
    if (__DEV__) console.log(`[NotificationNavigation] Routing to destination for type: ${type} with data:`, JSON.stringify(data, null, 2));

    switch (type) {
      // --- Order Detail/Tracking ---
      case NotificationType.ORDER_PLACED:
      case NotificationType.ORDER_CONFIRMED:
      case NotificationType.ORDER_PACKED:
      case NotificationType.ORDER_DELIVERED:
      case NotificationType.ORDER_CANCELLED:
      case NotificationType.ORDER_SHIPPED:
      case NotificationType.OUT_FOR_DELIVERY:
      case NotificationType.RETURN_REQUESTED:
      case NotificationType.REFUND_INITIATED:
      case NotificationType.REFUND_COMPLETED:
        if (data.orderId) {
          router.push({ pathname: '/profile/orders/track', params: { orderId: data.orderId } });
        } else {
          router.push('/profile/orders');
        }
        break;

      // --- Prescription Detail ---
      case NotificationType.PRESCRIPTION_UPLOADED:
      case NotificationType.PRESCRIPTION_APPROVED:
      case NotificationType.PRESCRIPTION_REJECTED:
        if (data.prescriptionId) {
          router.push({
            pathname: '/(prescription)/prescription-viewer',
            params: {
              prescriptionId: data.prescriptionId,
              status: data.status || '',
              imageUrls: data.imageUrls || '[]',
              // Lets the viewer fetch the order id the payload cannot carry.
              source: 'notification',
            },
          });
        } else {
          router.push('/(prescription)/prescription-history');
        }
        break;

      // --- Product Detail ---
      case NotificationType.PRODUCT:
      case NotificationType.PRODUCT_BACK_IN_STOCK:
      case NotificationType.PRICE_DROP: {
        // Bound to a const so the guard narrows away `undefined`.
        const productId = data.productId || data.id;
        if (productId) {
          router.push({ pathname: '/product/[id]', params: { id: productId } });
        } else {
          router.push('/notifications');
        }
        break;
      }

      // --- Category listing ---
      case NotificationType.CATEGORY: {
        const categoryId = data.categoryId || data.id;
        if (categoryId) {
          router.push({ pathname: '/category/[id]', params: { id: categoryId } });
        } else {
          router.push('/(tabs)/categories');
        }
        break;
      }

      // --- Coupons ---
      case NotificationType.COUPON:
        router.push('/(stack)/coupons');
        break;

      // --- Cart ---
      case NotificationType.CART_REMINDER:
        router.push('/(stack)/cart');
        break;

      // --- Wallet ---
      case NotificationType.WALLET:
        router.push('/profile/wallet');
        break;

      // --- Profile Info ---
      case NotificationType.PROFILE_VERIFICATION:
        router.push('/profile/my-profile');
        break;

      case NotificationType.WISHLIST:
      case NotificationType.LOYALTY_POINTS:
      case NotificationType.KYC_REQUIRED:
        router.push('/(tabs)/profile');
        break;

      // --- Home tab ---
      case NotificationType.HOME:
        router.push('/(tabs)');
        break;

      // --- Notifications screen ---
      case NotificationType.NOTIFICATIONS:
      case NotificationType.ANNOUNCEMENT:
        router.push('/notifications');
        break;

      // --- Chat support ---
      case NotificationType.CHAT:
        router.push('/profile/support/help');
        break;

      // --- App update: opens the store listing, not an in-app screen ---
      case NotificationType.APP_UPDATE:
        if (Platform.OS === 'android') {
          Linking.openURL(`market://details?id=${ANDROID_PACKAGE}`).catch(() =>
            Linking.openURL(`https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`),
          );
        } else if (__DEV__) {
          // TODO: wire up the App Store numeric ID once the app is published on iOS.
          console.warn('[NotificationNavigation] APP_UPDATE tapped on iOS but no App Store ID is configured yet.');
        }
        break;

      // --- Default Fallback for Unimplemented/Invalid/Unknown Types ---
      default:
        if (__DEV__) console.warn(`[NotificationNavigation] Unhandled or unknown notification type: ${type}. Falling back to Notifications.`);
        router.push('/notifications');
        break;
    }
  },
};
