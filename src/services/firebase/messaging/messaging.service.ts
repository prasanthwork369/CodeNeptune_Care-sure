import AsyncStorage from "@react-native-async-storage/async-storage";
import type FirebaseMessaging from "@react-native-firebase/messaging";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { notificationApi } from "../../../api/notification.api";
import { NOTIFICATION_CHANNELS } from "../../../constants/notificationChannels";
import { getDeviceInfo } from "../../../lib/deviceInfo";
import { isExpoGo } from "../../../utils/environment";

// Single composite cache key holding `${token}:${isAuthenticated}`. Storing one
// value (instead of token + auth separately) makes the write atomic — the app
// can't be killed mid-way and leave the two halves out of sync.
const CACHE_KEY = "caresure.push_token.registration";

// Session guards: skip a network call when the same key is already registered
// (lastRegisteredKey) or a registration for it is currently in flight
// (inProgressKey, prevents concurrent double-registration).
let lastRegisteredKey: string | null = null;
let inProgressKey: string | null = null;

// DEV-only: tracks how many times the registration API is actually called.
let __devApiCallCount = 0;

// Firebase Messaging is a native module unavailable in Expo Go — a static
// isExpoGo checks below ever run. Only required lazily, after that check.
const messaging = (): ReturnType<typeof FirebaseMessaging> =>
  (
    require("@react-native-firebase/messaging")
      .default as typeof FirebaseMessaging
  )();

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
      console.log(
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
          console.log(
            "[PushToken] Match found in cache. Skipping registration.",
          );
        return;
      }
    } catch {}

    // Logged here (not in registerWithBackend) so it only prints on an actual
    // registration — not on the startup calls that skip via the cache guard.
    const deviceInfo = await getDeviceInfo();
    if (__DEV__)
      console.log("[DeviceInfo]", JSON.stringify(deviceInfo, null, 2));
    if (__DEV__) {
      __devApiCallCount += 1;
      console.log(
        `[PushToken] POST /push-notifications/devices — call #${__devApiCallCount} this session`,
      );
    }
    await notificationApi.registerDevice(token, deviceInfo);

    // Cache only on success so a failed call never poisons the guard.
    await AsyncStorage.setItem(CACHE_KEY, key);
    lastRegisteredKey = key;
  } catch (error: any) {
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
    if (!Device.isDevice) return false;

    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === "granted") return true;

    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  },

  // Silent check — never shows the OS prompt. Used on startup so we can
  // register the token for users who already granted, without asking anyone
  // who hasn't (the prompt is shown later, at a contextual moment).
  hasPermission: async (): Promise<boolean> => {
    if (!Device.isDevice) return false;
    const { status } = await Notifications.getPermissionsAsync();
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
      if (Platform.OS === "ios") {
        await messaging().registerDeviceForRemoteMessages();
      }
      return await messaging().getToken();
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
    if (__DEV__) console.log("[PushToken]", token);
    if (!token) return;

    await syncToken(token);
  },

  updateToken: async (newToken: string): Promise<void> => {
    if (__DEV__) console.log("[PushToken:refreshed]", newToken);
    await syncToken(newToken);
  },

  unregister: async (): Promise<void> => {
    if (isExpoGo) return;
    try {
      const token = await messaging().getToken();
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
    Notifications.setNotificationHandler({
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
      await Notifications.setNotificationChannelAsync(
        NOTIFICATION_CHANNELS.ORDERS,
        {
          name: "Order Updates",
          importance: Notifications.AndroidImportance.HIGH,
          sound: "default",
        },
      );
      await Notifications.setNotificationChannelAsync(
        NOTIFICATION_CHANNELS.REMINDERS,
        {
          name: "Reminders",
          importance: Notifications.AndroidImportance.HIGH,
          sound: "default",
        },
      );
      await Notifications.setNotificationChannelAsync(
        NOTIFICATION_CHANNELS.OFFERS,
        {
          name: "Offers & Promotions",
          importance: Notifications.AndroidImportance.DEFAULT,
        },
      );
    } catch (error) {
      if (__DEV__)
        console.error("[PushChannels] Failed to set up channels:", error);
    }
  },
};
