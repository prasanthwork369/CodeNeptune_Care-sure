import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { notificationApi } from '../api/notification.api';
import { getDeviceInfo } from '../lib/deviceInfo';
import { isExpoGo } from '../utils/environment';

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

    getExpoPushToken: async (): Promise<string | null> => {
        if (isExpoGo) return null;
        try {
            const { data } = await Notifications.getExpoPushTokenAsync({
                projectId: '8af7d922-a6f0-45a5-8c9d-d51ba283e5c2',
            });
            return data;
        } catch {
            return null;
        }
    },

    registerWithBackend: async (): Promise<void> => {
        // Collect device info first — no permission needed, works in Expo Go too
        const deviceInfo = await getDeviceInfo();
        if (__DEV__) console.log('[DeviceInfo]', JSON.stringify(deviceInfo, null, 2));

        // Push token registration requires a real dev/prod build
        if (isExpoGo) return;

        const granted = await notificationService.requestPermission();
        if (!granted) return;

        const token = await notificationService.getExpoPushToken();
        if (__DEV__) console.log('[PushToken]', token);
        if (!token) return;

        // ── Backend ready? Replace the registerToken call below with: ──────────
        // await notificationApi.registerDevice({ push_token: token, ...deviceInfo });
        // ────────────────────────────────────────────────────────────────────────
        await notificationApi.registerToken({
            token,
            platform: Platform.OS as 'ios' | 'android',
            deviceName: deviceInfo.device_name,
            deviceModel: deviceInfo.device_model,
            osVersion: deviceInfo.device_os_version,
            appVersion: deviceInfo.app_version,
        }).catch(() => {});
    },

    updateToken: async (newToken: string): Promise<void> => {
        if (__DEV__) console.log('[PushToken:refreshed]', newToken);
        // ── Backend ready? Replace below with: ──────────────────────────────────
        // await notificationApi.updateToken({ push_token: newToken });
        // ────────────────────────────────────────────────────────────────────────
        await notificationApi.registerToken({
            token: newToken,
            platform: Platform.OS as 'ios' | 'android',
            deviceName: null,
            deviceModel: null,
            osVersion: null,
            appVersion: null,
        }).catch(() => {});
    },

    unregister: async (): Promise<void> => {
        if (isExpoGo) return;
        try {
            const { data: token } = await Notifications.getExpoPushTokenAsync({
                projectId: '8af7d922-a6f0-45a5-8c9d-d51ba283e5c2',
            });
            await notificationApi.removeToken(token).catch(() => {});
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
