import { asError } from "@/src/api/errors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Messaging } from "@react-native-firebase/messaging";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { notificationApi } from "@/src/features/notifications/api/notification.api";
import { NOTIFICATION_CHANNELS } from "../../../constants/notification-channels";
import { getDeviceInfo } from "../../../lib/deviceInfo";
import { isExpoGo } from "../../../utils/environment";
import { logger } from "@/src/utils/logger";

// Single composite cache key holding `${token}:${isAuthenticated}`. Storing one
// value (instead of token + auth separately) makes the write atomic — the app
// can't be killed mid-way and leave the two halves out of sync.
const CACHE_KEY = "caresure.push_token.registration";

// Dev logs still show enough of the token to eyeball a change/mismatch
// without printing the full credential to the device log.
const maskToken = (token: string): string =>
  token.length <= 12 ? "***" : `${token.slice(0, 6)}…${token.slice(-4)}`;

// Session guards: skip a network call when the same key is already registered
// (lastRegisteredKey) or a registration for it is currently in flight
// (inProgressKey, prevents concurrent double-registration).
let lastRegisteredKey: string | null = null;
let inProgressKey: string | null = null;

// DEV-only: tracks how many times the registration API is actually called.
let __devApiCallCount = 0;

// Firebase Messaging is a native module unavailable in Expo Go — a static
// isExpoGo checks below ever run. Only required lazily, after that check,
// and always through the modular API (the namespaced `messaging()` call
// pattern this used before is deprecated).
const messagingModule = (): typeof import("@react-native-firebase/messaging") =>
  require("@react-native-firebase/messaging");

const messaging = (): Messaging => messagingModule().getMessaging();

// expo-notifications throws on Android as soon as its JS module is evaluated
// inside Expo Go (SDK 53 removed native push support there) — a static import
// would crash the whole bundle before any isExpoGo check below ever ran.
// Lazily required instead, same as Firebase Messaging above.
const notificationsModule = (): typeof import("expo-notifications") =>
  require("expo-notifications");

// The identity of a registration: same token means
// the backend already has what it needs, so we can skip the call.
const registrationKey = (token: string): string => token;

/**
 * Registers a token with the backend exactly once per (token, auth) identity.
 * Shared by initial registration and token-refresh so the de-dup/cache logic
 * lives in one place. Assumes permission/Expo-Go gating already passed.
 */
const syncToken = async (token: string): Promise<void> => {
  const key = registrationKey(token);

  // Already handled this key this session (or a call is mid-flight) — skip.
  if (lastRegisteredKey === key || inProgressKey === key) {
    if (__DEV__)
      logger.debug(
        "[PushToken] Already registered/registering this session. Skipping.",
      );
    return;
  }

  // Claim the key synchronously — BEFORE any await — so two concurrent callers
  // (e.g. the startup effect + Firebase's onTokenRefresh firing together) can't
  // both slip past the guard and double-register the same token.
  inProgressKey = key;
  try {
    // Persisted across launches — skip if the backend already has this identity.
    try {
      if ((await AsyncStorage.getItem(CACHE_KEY)) === key) {
        lastRegisteredKey = key; // sync in-memory guard
        if (__DEV__)
          logger.debug(
            "[PushToken] Match found in cache. Skipping registration.",
          );
        return;
      }
    } catch {}

    // Logged here (not in registerWithBackend) so it only prints on an actual
    // registration — not on the startup calls that skip via the cache guard.
    const deviceInfo = await getDeviceInfo();
    if (__DEV__)
      logger.debug("[DeviceInfo]", JSON.stringify(deviceInfo, null, 2));
    if (__DEV__) {
      __devApiCallCount += 1;
      logger.debug(
        `[PushToken] POST /push-notifications/devices — call #${__devApiCallCount} this session`,
      );
    }
    await notificationApi.registerDevice(token, deviceInfo);

    // Cache only on success so a failed call never poisons the guard.
    await AsyncStorage.setItem(CACHE_KEY, key);
    lastRegisteredKey = key;
  } catch (e) {
    const error = asError(e);
    if (__DEV__) {
      const status = error?.response?.status || error?.status;
      if (status === 429) {
        console.warn(
          "[PushToken] Rate-limited (429). Will retry on next login or token refresh.",
        );
      } else {
        console.warn(
          "[PushToken] Failed to register with backend:",
          error?.message || error,
        );
      }
    }
  } finally {
    if (inProgressKey === key) inProgressKey = null;
  }
};

// Remote push notifications are unsupported in Expo Go (SDK 53+).
// Remove the `isExpoGo` checks below once running via a development build.
export const notificationService = {
  requestPermission: async (): Promise<boolean> => {
    if (isExpoGo || !Device.isDevice) return false;

    const { status: existing } =
      await notificationsModule().getPermissionsAsync();
    if (existing === "granted") return true;

    const { status } = await notificationsModule().requestPermissionsAsync();
    return status === "granted";
  },

  // Silent check — never shows the OS prompt. Used on startup so we can
  // register the token for users who already granted, without asking anyone
  // who hasn't (the prompt is shown later, at a contextual moment).
  hasPermission: async (): Promise<boolean> => {
    if (isExpoGo || !Device.isDevice) return false;
    const { status } = await notificationsModule().getPermissionsAsync();
    return status === "granted";
  },

  // Shows the OS prompt (once) and registers the token if granted. Called at
  // contextual moments — after the signup bonus popup for first-time users,
  // or a few seconds after home for everyone else.
  promptAndRegister: async (): Promise<void> => {
    if (isExpoGo) return;
    const granted = await notificationService.requestPermission();
    if (granted) await notificationService.registerWithBackend();
  },

  // True once this device's push token has been registered with the backend at
  // least once (a device_tokens row exists for its deviceId). Login uses this to
  // decide whether to send deviceId for the token→account claim — sending it
  // before any registration makes the backend's claimByDeviceId() a no-op that
  // logs a warning. The cache key is written only after a successful register.
  isRegistered: async (): Promise<boolean> => {
    try {
      return (await AsyncStorage.getItem(CACHE_KEY)) !== null;
    } catch {
      return false;
    }
  },

  // The raw FCM/APNs device token — this is what the backend's Firebase Admin
  // SDK actually sends to, NOT Expo's wrapped `ExponentPushToken[...]` format.
  getFcmToken: async (): Promise<string | null> => {
    if (isExpoGo) return null;
    try {
      const { registerDeviceForRemoteMessages, getToken } = messagingModule();
      if (Platform.OS === "ios") {
        await registerDeviceForRemoteMessages(messaging());
      }
      return await getToken(messaging());
    } catch {
      return null;
    }
  },

  registerWithBackend: async (): Promise<void> => {
    // Push token registration requires a real dev/prod build
    if (isExpoGo) return;

    // Silent on startup — only register if the user already granted. The
    // actual prompt is shown later on the home screen (useHomeOnboarding).
    const granted = await notificationService.hasPermission();
    if (!granted) return;

    const token = await notificationService.getFcmToken();
    if (!token) return;
    if (__DEV__) logger.debug("[PushToken]", maskToken(token));

    await syncToken(token);
  },

  updateToken: async (newToken: string): Promise<void> => {
    if (__DEV__) logger.debug("[PushToken:refreshed]", maskToken(newToken));
    await syncToken(newToken);
  },

  unregister: async (): Promise<void> => {
    if (isExpoGo) return;
    try {
      const token = await messagingModule().getToken(messaging());
      await notificationApi.removeToken(token).catch(() => {});
    } catch {}

    // Clear all registration guards so a later re-register isn't blocked by a
    // stale key — reset even if removeToken failed above.
    lastRegisteredKey = null;
    inProgressKey = null;
    await AsyncStorage.removeItem(CACHE_KEY).catch(() => {});
  },

  configureBehavior: () => {
    if (isExpoGo) return;
    notificationsModule().setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  },

  /**
   * Creates the Android notification channels the backend can target via the
   * FCM message's `channelId`. Separating them lets users mute offers without
   * losing order/transaction alerts. No-op on iOS (channels are Android-only).
   */
  setupAndroidChannels: async (): Promise<void> => {
    if (isExpoGo || Platform.OS !== "android") return;
    try {
      const notifications = notificationsModule();
      await notifications.setNotificationChannelAsync(
        NOTIFICATION_CHANNELS.ORDERS,
        {
          name: "Order Updates",
          importance: notifications.AndroidImportance.HIGH,
        },
      );
      await notifications.setNotificationChannelAsync(
        NOTIFICATION_CHANNELS.REMINDERS,
        {
          name: "Reminders",
          importance: notifications.AndroidImportance.HIGH,
        },
      );
      await notifications.setNotificationChannelAsync(
        NOTIFICATION_CHANNELS.OFFERS,
        {
          name: "Offers & Promotions",
          importance: notifications.AndroidImportance.DEFAULT,
        },
      );
    } catch (error) {
      if (__DEV__)
        console.error("[PushChannels] Failed to set up channels:", error);
    }
  },
};
