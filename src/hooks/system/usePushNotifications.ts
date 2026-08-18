import { isExpoGo } from "@/src/utils/environment";
import type { Messaging } from "@react-native-firebase/messaging";
import { useRootNavigationState } from "expo-router";
import type * as Notifications from "expo-notifications";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { messagingService as notificationService } from "../../services/firebase";
import { notifeeService } from "../../services/notifications/notifeeService";
import { showProductOffer } from "../../services/notifications/productOfferNotification";
// Registers the __DEV__-only global testProductOffer() console trigger.
import "../../services/notifications/devProductOfferTest";
import { NotificationNavigation } from "../../services/notifications/NotificationNavigation";
import { useAuthStore } from "@/src/store/authStore";
import { useNotificationStore } from "@/src/store/notificationStore";
import {
  NotificationData,
  NotificationPayload,
  NotificationType,
} from "../../types/notification";
import { logger } from "@/src/utils/logger";

// Firebase Messaging is a native module unavailable in Expo Go — a static
// top-level `import` would crash the JS bundle on load there before the
// isExpoGo checks below ever run. Only required lazily, after that check,
// and always through the modular API (the namespaced `messaging()` call
// pattern this used before is deprecated).
const messagingModule = (): typeof import("@react-native-firebase/messaging") =>
  require("@react-native-firebase/messaging");

const messaging = (): Messaging => messagingModule().getMessaging();

// expo-notifications throws on Android as soon as its JS module is evaluated
// inside Expo Go (SDK 53 removed native push support there) — a static value
// import would crash the whole bundle before any isExpoGo check below ever
// ran. Lazily required instead; only types are imported statically above.
const notificationsModule = (): typeof import("expo-notifications") =>
  require("expo-notifications");

/** Builds a routing payload + de-dup id from a notification's `data` block. */
const buildPayloadFromData = (
  data: NotificationData,
  tapId: string,
): { payload: NotificationPayload; tapId: string } => {
  // Parse `type` or `screen` field case-insensitively
  const rawType = data.type || data.screen || "";
  const normalizedType = rawType.toUpperCase().trim() as NotificationType;

  let parsedParams: NotificationData = { ...data };
  if (typeof data.data === "string") {
    try {
      parsedParams = { ...parsedParams, ...JSON.parse(data.data) };
    } catch {}
  }

  return { payload: { type: normalizedType, data: parsedParams }, tapId };
};

/** Tap coming through expo-notifications (foreground-presented / local). */
const buildTapPayload = (response: Notifications.NotificationResponse) => {
  const data = (response.notification.request.content.data ??
    {}) as NotificationData;
  // Prefer the FCM message id as the de-dup key so this tap matches the same
  // message arriving through the Firebase handlers (getInitialNotification /
  // onNotificationOpenedApp) — both listeners can fire for one background tap,
  // and identical tapIds make handleTap navigate only once.
  const messageId = data["google.message_id"];
  const tapId =
    messageId || response.actionIdentifier + response.notification.date;
  return buildPayloadFromData(data, tapId);
};

/** Tap coming through Firebase (OS-displayed FCM notification, background/killed). */
const buildFcmTapPayload = (remoteMessage: {
  data?: Record<string, unknown>;
  messageId?: string;
}) =>
  buildPayloadFromData(
    (remoteMessage.data ?? {}) as NotificationData,
    remoteMessage.messageId ?? String(Date.now()),
  );

// Remote push notifications are unsupported in Expo Go (SDK 53+).
// Remove the `isExpoGo` check below once running via a development build.
export const usePushNotifications = () => {
  const isLoaded = useAuthStore((s) => s.isLoaded);
  // Root navigator readiness — `key` is set only once the navigation tree is
  // mounted. Cold-start navigation must wait for this so it lands AFTER index's
  // initial redirect settles (otherwise the redirect can clobber the target).
  const navReady = !!useRootNavigationState()?.key;
  const addNotification = useNotificationStore((s) => s.add);
  const responseListener = useRef<
    | ReturnType<typeof Notifications.addNotificationResponseReceivedListener>
    | undefined
  >(undefined);
  const foregroundListener = useRef<
    ReturnType<typeof Notifications.addNotificationReceivedListener> | undefined
  >(undefined);
  const hasHandledColdStart = useRef(false);

  useEffect(() => {
    notificationService.configureBehavior();
    notificationService.setupAndroidChannels().catch(() => {});
  }, []);

  // Registers the push token once on app launch (anonymous).
  // The backend links the token to the user account via deviceId at OTP verify.
  useEffect(() => {
    if (!isLoaded) return;
    notificationService.registerWithBackend().catch(() => {});
  }, [isLoaded]);

  useEffect(() => {
    if (isExpoGo) return;

    // Token rotated mid-session — re-register with backend using the new token.
    // Always anonymous (false) — backend links user via deviceId at OTP verify.
    const unsubscribe = messagingModule().onTokenRefresh(
      messaging(),
      (newToken) => {
        notificationService.updateToken(newToken).catch(() => {});
      },
    );

    return unsubscribe;
  }, []);

  // Foreground FCM messages. Android suppresses notification-message banners
  // while the app is open, and @react-native-firebase/messaging (not
  // expo-notifications) owns the FirebaseMessagingService — so expo's
  // addNotificationReceivedListener never fires for these. Re-present the
  // message as a local notification here to make it visible: the
  // setNotificationHandler shows the banner and the received listener above
  // then saves it to the store (single path, no duplicate). Android only —
  // iOS already surfaces foreground notification messages via expo's handler,
  // so re-presenting there would show a duplicate banner.
  useEffect(() => {
    if (isExpoGo || Platform.OS !== "android") return;

    const unsubscribe = messagingModule().onMessage(
      messaging(),
      async (remoteMessage) => {
        if (__DEV__)
          logger.debug(
            "[PushNotificationHook] Foreground FCM message:",
            JSON.stringify(remoteMessage, null, 2),
          );
        // Marketing product offers use the custom RemoteViews layout; a
        // native failure falls through to the branded path so nothing is
        // dropped.
        const data = (remoteMessage?.data ?? {}) as NotificationData;
        const shownAsOffer = await showProductOffer(data).catch(() => false);
        // Present via notifee so the CareSure colour large icon shows.
        // notifee notifications don't fire expo's
        // addNotificationReceivedListener, so we save to the store here
        // directly (single path, no duplicate).
        if (!shownAsOffer) {
          await notifeeService.displayBranded(remoteMessage).catch(() => {});
        }
        addNotification({
          title:
            remoteMessage?.notification?.title ?? data.title ?? "Notification",
          body: remoteMessage?.notification?.body ?? data.discountText ?? "",
          data,
        });
      },
    );

    return unsubscribe;
  }, [addNotification]);

  // Foreground tap on a notifee-displayed notification → route it. (Background/
  // killed taps still come through the Firebase handlers below.)
  useEffect(() => {
    if (isExpoGo || Platform.OS !== "android") return;
    const unsubscribe = notifeeService.addForegroundPressListener(
      (data, tapId) => {
        const { payload } = buildPayloadFromData(data, tapId);
        NotificationNavigation.handleTap(payload, tapId);
      },
    );
    return unsubscribe;
  }, []);

  // Handle Cold Start (app launched by tapping a notification). Waits for auth
  // load + the root navigator being ready, so index's redirect settles and our
  // push lands on top of it instead of being replaced. Runs the navigation only
  // once, from whichever source actually holds the tap (see below).
  const runColdStart = (payload: NotificationPayload, tapId: string) => {
    if (hasHandledColdStart.current) return;
    hasHandledColdStart.current = true;
    // Defer one frame so index's <Redirect> commits before we push.
    requestAnimationFrame(() =>
      NotificationNavigation.handleTap(payload, tapId),
    );
  };

  // Primary cold-start source on Android: FCM notifications are displayed by
  // Firebase (it owns the messaging service), so the launch tap arrives here —
  // NOT through expo's getLastNotificationResponseAsync (which returns null for
  // them). This is what makes a killed-app tap actually redirect.
  useEffect(() => {
    if (isExpoGo) return;
    if (__DEV__)
      logger.debug(
        `[PushNotificationHook] Cold-start gate — isLoaded:${isLoaded} navReady:${navReady}`,
      );
    if (!isLoaded || !navReady) return;
    messagingModule()
      .getInitialNotification(messaging())
      .then((remoteMessage) => {
        if (__DEV__)
          logger.debug(
            "[PushNotificationHook] Cold start (FCM) getInitialNotification:",
            remoteMessage ? JSON.stringify(remoteMessage, null, 2) : "null",
          );
        if (!remoteMessage) return;
        const { payload, tapId } = buildFcmTapPayload(remoteMessage);
        runColdStart(payload, tapId);
      })
      .catch((e) => {
        if (__DEV__)
          logger.debug(
            "[PushNotificationHook] getInitialNotification error:",
            e,
          );
      });
  }, [isLoaded, navReady]);

  // Secondary cold-start source: notifications presented locally by
  // expo-notifications (e.g. our foreground re-present). Shares the same guard
  // so it never double-navigates with the FCM source above.
  useEffect(() => {
    if (!isLoaded || !navReady || isExpoGo) return;
    notificationsModule()
      .getLastNotificationResponseAsync()
      .then((response) => {
        if (!response) return;
        const { payload, tapId } = buildTapPayload(response);
        runColdStart(payload, tapId);
      });
  }, [isLoaded, navReady]);

  // Cold-start tap on a notifee-displayed (data-only) notification. Shares the
  // same runColdStart guard so it never double-navigates with the FCM/expo
  // sources above.
  useEffect(() => {
    if (!isLoaded || !navReady || isExpoGo) return;
    notifeeService.getInitialTap().then((res) => {
      if (!res) return;
      const { payload } = buildPayloadFromData(res.data, res.tapId);
      runColdStart(payload, res.tapId);
    });
  }, [isLoaded, navReady]);

  // Background → foreground tap: app was alive in the background, the FCM
  // notification was shown by the OS, and the user tapped it. Firebase delivers
  // it here (again, not through expo's response listener for FCM messages).
  useEffect(() => {
    if (isExpoGo) return;
    const unsubscribe = messagingModule().onNotificationOpenedApp(
      messaging(),
      (remoteMessage) => {
        if (!remoteMessage) return;
        if (__DEV__)
          logger.debug(
            "[PushNotificationHook] Notification opened app (FCM):",
            JSON.stringify(remoteMessage, null, 2),
          );
        const { payload, tapId } = buildFcmTapPayload(remoteMessage);
        NotificationNavigation.handleTap(payload, tapId);
      },
    );
    return unsubscribe;
  }, []);

  // Handle Taps / Foreground interactions while app is active
  useEffect(() => {
    if (isExpoGo) return;

    const notifications = notificationsModule();

    // Foreground notification received — save to store
    foregroundListener.current = notifications.addNotificationReceivedListener(
      (notification) => {
        if (__DEV__)
          logger.debug(
            "[PushNotificationHook] Foreground notification received:",
            JSON.stringify(notification, null, 2),
          );
        const { title, body, data } = notification.request.content;
        addNotification({
          title: title ?? "Notification",
          body: body ?? "",
          data: (data as NotificationData) ?? {},
        });
      },
    );

    // Notification tapped (foreground / background)
    responseListener.current =
      notifications.addNotificationResponseReceivedListener((response) => {
        if (__DEV__)
          logger.debug(
            "[PushNotificationHook] Notification tapped (response listener):",
            JSON.stringify(response, null, 2),
          );
        const { payload, tapId } = buildTapPayload(response);
        NotificationNavigation.handleTap(payload, tapId);
      });

    return () => {
      foregroundListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [addNotification]);
};
