import AsyncStorage from '@react-native-async-storage/async-storage';
import type FirebaseMessaging from '@react-native-firebase/messaging';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { notificationApi } from '../api/notification.api';
import { NOTIFICATION_CHANNELS } from '../constants/notificationChannels';
import { getDeviceInfo } from '../lib/deviceInfo';
import { isExpoGo } from '../utils/environment';

const CACHE_KEY_TOKEN = 'caresure.push_token.last_registered';
const CACHE_KEY_AUTH = 'caresure.push_token.last_auth_state';

// Firebase Messaging is a native module unavailable in Expo Go — a static
// top-level `import` would crash the JS bundle on load there before the
// isExpoGo checks below ever run. Only required lazily, after that check.
const messaging = (): ReturnType<typeof FirebaseMessaging> =>
    (require('@react-native-firebase/messaging').default as typeof FirebaseMessaging)();

// Remote push notifications are unsupported in Expo Go (SDK 53+).
// Remove the `isExpoGo` checks below once running via a development build.
export const notificationService = {
    requestPermission: async (): Promise<boolean> => {
        if (!Device.isDevice) return false;

        const { status: existing } = await Notifications.getPermissionsAsync();
        if (existing === 'granted') return true;

        const { status } = await Notifications.requestPermissionsAsync();
        return status === 'granted';
    },

    // Silent check — never shows the OS prompt. Used on startup so we can
    // register the token for users who already granted, without asking anyone
    // who hasn't (the prompt is shown later, at a contextual moment).
    hasPermission: async (): Promise<boolean> => {
        if (!Device.isDevice) return false;
        const { status } = await Notifications.getPermissionsAsync();
        return status === 'granted';
    },

    // Shows the OS prompt (once) and registers the token if granted. Called at
    // contextual moments — after the signup bonus popup for first-time users,
    // or a few seconds after home for everyone else.
    promptAndRegister: async (isAuthenticated: boolean): Promise<void> => {
        if (isExpoGo) return;
        const granted = await notificationService.requestPermission();
        if (granted) await notificationService.registerWithBackend(isAuthenticated);
    },

    // The raw FCM/APNs device token — this is what the backend's Firebase Admin
    // SDK actually sends to, NOT Expo's wrapped `ExponentPushToken[...]` format.
    getFcmToken: async (): Promise<string | null> => {
        if (isExpoGo) return null;
        try {
            if (Platform.OS === 'ios') {
                await messaging().registerDeviceForRemoteMessages();
            }
            return await messaging().getToken();
        } catch {
            return null;
        }
    },

    /** Registers the device (if needed) and, when logged in, attaches the token to the account. */
    registerOrClaim: async (token: string, deviceId: string | null, isAuthenticated: boolean): Promise<void> => {
        await notificationApi.registerDevice(token, deviceId);
        if (isAuthenticated) {
            await notificationApi.claimToken(token);
        }
    },

    registerWithBackend: async (isAuthenticated: boolean): Promise<void> => {
        // Collect device info first — no permission needed, works in Expo Go too
        const deviceInfo = await getDeviceInfo();
        if (__DEV__) console.log('[DeviceInfo]', JSON.stringify(deviceInfo, null, 2));

        // Push token registration requires a real dev/prod build
        if (isExpoGo) return;

        // Silent on startup — only register if the user already granted. The
        // actual prompt is shown later on the home screen (useHomeOnboarding).
        const granted = await notificationService.hasPermission();
        if (!granted) return;

        const token = await notificationService.getFcmToken();
        if (__DEV__) console.log('[PushToken]', token);
        if (!token) return;

        // Check cache before hitting the API
        try {
            const cachedToken = await AsyncStorage.getItem(CACHE_KEY_TOKEN);
            const cachedAuth = await AsyncStorage.getItem(CACHE_KEY_AUTH);
            const currentAuthStr = String(isAuthenticated);
            if (token === cachedToken && currentAuthStr === cachedAuth) {
                if (__DEV__) console.log('[PushToken] Match found in cache. Skipping registration.');
                return;
            }
        } catch {}

        try {
            await notificationService.registerOrClaim(token, deviceInfo.installation_id, isAuthenticated);

            // Save to cache only on success
            await AsyncStorage.setItem(CACHE_KEY_TOKEN, token);
            await AsyncStorage.setItem(CACHE_KEY_AUTH, String(isAuthenticated));
        } catch (error) {
            if (__DEV__) console.error('[PushToken] Failed to register with backend:', error);
        }
    },

    updateToken: async (newToken: string, isAuthenticated: boolean): Promise<void> => {
        if (__DEV__) console.log('[PushToken:refreshed]', newToken);

        // Check cache before hitting the API
        try {
            const cachedToken = await AsyncStorage.getItem(CACHE_KEY_TOKEN);
            const cachedAuth = await AsyncStorage.getItem(CACHE_KEY_AUTH);
            const currentAuthStr = String(isAuthenticated);
            if (newToken === cachedToken && currentAuthStr === cachedAuth) {
                if (__DEV__) console.log('[PushToken:refreshed] Match found in cache. Skipping registration.');
                return;
            }
        } catch {}

        try {
            const deviceInfo = await getDeviceInfo();
            await notificationService.registerOrClaim(newToken, deviceInfo.installation_id, isAuthenticated);

            // Save to cache only on success
            await AsyncStorage.setItem(CACHE_KEY_TOKEN, newToken);
            await AsyncStorage.setItem(CACHE_KEY_AUTH, String(isAuthenticated));
        } catch (error) {
            if (__DEV__) console.error('[PushToken:refreshed] Failed to update with backend:', error);
        }
    },

    unregister: async (): Promise<void> => {
        if (isExpoGo) return;
        try {
            const token = await messaging().getToken();
            await notificationApi.removeToken(token).catch(() => {});

            // Clear local cached token/auth state on unregister
            await AsyncStorage.removeItem(CACHE_KEY_TOKEN);
            await AsyncStorage.removeItem(CACHE_KEY_AUTH);
        } catch {}
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
        if (isExpoGo || Platform.OS !== 'android') return;
        try {
            await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.ORDERS, {
                name: 'Order Updates',
                importance: Notifications.AndroidImportance.HIGH,
                sound: 'default',
            });
            await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.REMINDERS, {
                name: 'Reminders',
                importance: Notifications.AndroidImportance.HIGH,
                sound: 'default',
            });
            await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.OFFERS, {
                name: 'Offers & Promotions',
                importance: Notifications.AndroidImportance.DEFAULT,
            });
        } catch (error) {
            if (__DEV__) console.error('[PushChannels] Failed to set up channels:', error);
        }
    },
};
