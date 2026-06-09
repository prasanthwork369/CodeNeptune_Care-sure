import * as Application from 'expo-application';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { notificationApi } from '../api/notification.api';

export const notificationService = {
    requestPermission: async (): Promise<boolean> => {
        if (!Device.isDevice) return false;

        const { status: existing } = await Notifications.getPermissionsAsync();
        if (existing === 'granted') return true;

        const { status } = await Notifications.requestPermissionsAsync();
        return status === 'granted';
    },

    getExpoPushToken: async (): Promise<string | null> => {
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
        const granted = await notificationService.requestPermission();
        if (!granted) return;

        const token = await notificationService.getExpoPushToken();
        if (__DEV__) console.log('[PushToken]', token);
        if (!token) return;

        await notificationApi.registerToken({
            token,
            platform: Platform.OS as 'ios' | 'android',
            deviceName: Device.deviceName ?? null,
            deviceModel: Device.modelName ?? null,
            osVersion: Device.osVersion ?? null,
            appVersion: Application.nativeApplicationVersion ?? null,
        }).catch(() => {});
    },

    unregister: async (): Promise<void> => {
        try {
            const { data: token } = await Notifications.getExpoPushTokenAsync({
                projectId: '8af7d922-a6f0-45a5-8c9d-d51ba283e5c2',
            });
            await notificationApi.removeToken(token).catch(() => {});
        } catch {}
    },

    configureBehavior: () => {
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
