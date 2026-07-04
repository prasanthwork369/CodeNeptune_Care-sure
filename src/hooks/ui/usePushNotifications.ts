import { isExpoGo } from '@/src/utils/environment';
import type FirebaseMessaging from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef } from 'react';
import { notificationService } from '../../services/notification.service';
import { NotificationNavigation } from '../../services/NotificationNavigation';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import { NotificationData, NotificationPayload, NotificationType } from '../../types/notification';

// Firebase Messaging is a native module unavailable in Expo Go — a static
// top-level `import` would crash the JS bundle on load there before the
// isExpoGo checks below ever run. Only required lazily, after that check.
const messaging = (): ReturnType<typeof FirebaseMessaging> =>
    (require('@react-native-firebase/messaging').default as typeof FirebaseMessaging)();

/** Turns a notification-tap response into a routing payload + a stable de-dup id. */
const buildTapPayload = (
    response: Notifications.NotificationResponse,
): { payload: NotificationPayload; tapId: string } => {
    const data = (response.notification.request.content.data ?? {}) as NotificationData;
    const tapId = response.actionIdentifier + response.notification.date;

    // Parse `type` or `screen` field case-insensitively
    const rawType = data.type || data.screen || '';
    const normalizedType = rawType.toUpperCase().trim() as NotificationType;

    let parsedParams: NotificationData = { ...data };
    if (typeof data.data === 'string') {
        try {
            parsedParams = { ...parsedParams, ...JSON.parse(data.data) };
        } catch {}
    }

    return { payload: { type: normalizedType, data: parsedParams }, tapId };
};

// Remote push notifications are unsupported in Expo Go (SDK 53+).
// Remove the `isExpoGo` check below once running via a development build.
export const usePushNotifications = () => {                                                 
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const isLoaded = useAuthStore((s) => s.isLoaded);
    const addNotification = useNotificationStore((s) => s.add);
    const responseListener = useRef<ReturnType<typeof Notifications.addNotificationResponseReceivedListener> | undefined>(undefined);
    const foregroundListener = useRef<ReturnType<typeof Notifications.addNotificationReceivedListener> | undefined>(undefined);
    const hasHandledColdStart = useRef(false);

    useEffect(() => {
        notificationService.configureBehavior();
        notificationService.setupAndroidChannels().catch(() => {});
    }, []);

    useEffect(() => {
        if (!isLoaded) return;
        notificationService.registerWithBackend(isAuthenticated).catch(() => {});
    }, [isLoaded, isAuthenticated]);

    useEffect(() => {
        if (isExpoGo) return;

        // Token rotated mid-session (iOS can issue a new token while app is open)
        const unsubscribe = messaging().onTokenRefresh((newToken) => {
            notificationService.updateToken(newToken, useAuthStore.getState().isAuthenticated).catch(() => {});
        });

        return unsubscribe;
    }, []);

    // Handle Cold Start (App launched via notification tap)
    useEffect(() => {
        if (!isLoaded || isExpoGo) return;

        if (!hasHandledColdStart.current) {
            hasHandledColdStart.current = true;
            Notifications.getLastNotificationResponseAsync().then((response) => {
                if (!response) return;
                if (__DEV__) console.log('[PushNotificationHook] Cold start response received:', JSON.stringify(response, null, 2));

                const { payload, tapId } = buildTapPayload(response);
                NotificationNavigation.handleTap(payload, tapId);
            });
        }
    }, [isLoaded]);

    // Handle Taps / Foreground interactions while app is active
    useEffect(() => {
        if (isExpoGo) return;

        // Foreground notification received — save to store
        foregroundListener.current = Notifications.addNotificationReceivedListener(
            (notification) => {
                if (__DEV__) console.log('[PushNotificationHook] Foreground notification received:', JSON.stringify(notification, null, 2));
                const { title, body, data } = notification.request.content;
                addNotification({
                    title: title ?? 'Notification',
                    body: body ?? '',
                    data: (data as NotificationData) ?? {},
                });
            }
        );

        // Notification tapped (foreground / background)
        responseListener.current = Notifications.addNotificationResponseReceivedListener(
            (response) => {
                if (__DEV__) console.log('[PushNotificationHook] Notification tapped (response listener):', JSON.stringify(response, null, 2));
                const { payload, tapId } = buildTapPayload(response);
                NotificationNavigation.handleTap(payload, tapId);
            }
        );

        return () => {
            foregroundListener.current?.remove();
            responseListener.current?.remove();
        };
    }, [addNotification]);
};
