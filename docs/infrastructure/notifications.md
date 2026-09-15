# Push & In-App Notifications Architecture 🔔

This document details the dual-engine push notification architecture combining **Firebase Cloud Messaging (FCM)** and **Notifee**, foreground/background dispatchers, and deep-link routing in **CareSure Customer**.

---

## 1. Dual-Engine Architecture Overview

CareSure splits notification responsibilities across two specialized libraries:

```text
               Remote Server Emits Push
                          │
                          ▼
        Firebase Cloud Messaging (@react-native-firebase/messaging)
        (Handles device token registration & incoming transport)
                          │
            ┌─────────────┴─────────────┐
            ▼                           ▼
    App in Foreground           App in Background / Killed
            │                           │
  usePushNotifications hook     index.js background handler
            │                           │
            └─────────────┬─────────────┘
                          ▼
            Notifee (@notifee/react-native)
  (Renders rich interactive banners with channels, sound, icons)
                          │
                 User Taps Notification
                          │
                          ▼
          NotificationNavigation.handleTap()
  (Validates authentication & dispatches deep link: /order/[id], /product/[id])
```

---

## 2. Notification Channels (Android)

Android 8.0+ requires notification channels. CareSure registers dedicated channels via `notifeeService.ts`:
- **`orders`**: High-importance sound and vibration for order status updates (placed, shipped, out for delivery).
- **`prescriptions`**: Updates regarding doctor prescription review, approval, or rejection.
- **`promotions`**: Marketing offers, flash sales, and CareSure Coins bonuses (low priority, silent).
- **`reminders`**: Medicine refill reminders and dosage schedules.

---

## 3. Headless Background Handling (`index.js`)

When a push notification arrives while the Android app process is completely stopped:
- Android starts a lightweight headless React Native task.
- `index.js` imports `backgroundHandler.ts` and `notifeeBackgroundHandler.ts` **before** Expo Router mounts.
- This ensures notification payloads are displayed without spinning up unnecessary UI components or crashing due to missing navigation contexts.

---

## 4. Deep-Link Routing (`NotificationNavigation.ts`)

When a user taps a notification:
1. **Deduplication**: `NotificationNavigation` checks `lastHandledTapId` in `notificationNavigationStore` to ignore accidental double-taps.
2. **Auth Guarding**: Sensitive notification types (e.g. `ORDER_SHIPPED`, `PRESCRIPTION_APPROVED`) require an active login session. If the user is unauthenticated, the target route is stored in `notificationNavigationStore`, and the user is prompted to log in first.
3. **Route Dispatch**:
   - Order notifications -> `router.push({ pathname: "/profile/orders/track", params: { id: orderId } })`
   - Prescription notifications -> `router.push("/(prescription)/prescription-viewer")`
   - Product campaigns -> `router.push({ pathname: "/product/[id]", params: { id: productId } })`
   - Wallet updates -> `router.push("/profile/wallet")`

---

## 5. Custom Native Notification Templates (`modules/native-notifications`)

For promotional campaigns requiring custom Android layouts (e.g. rich image banners with dual CTA buttons like "Buy Now" and "View Details"), CareSure utilizes custom Android `RemoteViews` implemented in `modules/native-notifications`.
