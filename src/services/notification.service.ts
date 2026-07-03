import AsyncStorage from '@react-native-async-storage/async-storage';
import type FirebaseMessaging from '@react-native-firebase/messaging';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { notificationApi } from '../api/notification.api';
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

        const granted = await notificationService.requestPermission();
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
};
