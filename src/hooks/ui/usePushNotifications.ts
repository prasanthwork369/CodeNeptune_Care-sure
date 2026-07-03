import messaging from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import { isExpoGo } from '@/src/utils/environment';
import { useEffect, useRef } from 'react';
import { notificationService } from '../../services/notification.service';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import { NotificationNavigation } from '../../services/NotificationNavigation';
import { NotificationType } from '../../types/notification';

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
        if (!isLoaded) return;

        if (!hasHandledColdStart.current) {
            hasHandledColdStart.current = true;
            Notifications.getLastNotificationResponseAsync().then((response) => {
                if (!response) return;
                console.log('[PushNotificationHook] Cold start response received:', JSON.stringify(response, null, 2));

                const data = response.notification.request.content.data as Record<string, any>;
                const tapId = response.actionIdentifier + response.notification.date;
                
                // Parse screen or type field case-insensitively
                const rawType = (data.type || data.screen || '') as string;
                const normalizedType = rawType.toUpperCase().trim() as NotificationType;

                let parsedParams = { ...data };
                if (typeof data.data === 'string') {
                    try {
                        parsedParams = { ...parsedParams, ...JSON.parse(data.data) };
                    } catch {}
                }

                NotificationNavigation.handleTap({
                    type: normalizedType,
                    data: parsedParams,
                }, tapId);
            });
        }
    }, [isLoaded]);

    // Handle Taps / Foreground interactions while app is active
    useEffect(() => {
        if (isExpoGo) return;

        // Foreground notification received — save to store
        foregroundListener.current = Notifications.addNotificationReceivedListener(
            (notification) => {
                console.log('[PushNotificationHook] Foreground notification received:', JSON.stringify(notification, null, 2));
                const { title, body, data } = notification.request.content;
                addNotification({
                    title: title ?? 'Notification',
                    body: body ?? '',
                    data: (data as Record<string, any>) ?? {},
                });
            }
        );

        // Notification tapped (foreground / background)
        responseListener.current = Notifications.addNotificationResponseReceivedListener(
            (response) => {
                console.log('[PushNotificationHook] Notification tapped (response listener):', JSON.stringify(response, null, 2));
                const data = response.notification.request.content.data as Record<string, any>;
                const tapId = response.actionIdentifier + response.notification.date;
                
                // Parse screen or type field case-insensitively
                const rawType = (data.type || data.screen || '') as string;
                const normalizedType = rawType.toUpperCase().trim() as NotificationType;

                let parsedParams = { ...data };
                if (typeof data.data === 'string') {
                    try {
                        parsedParams = { ...parsedParams, ...JSON.parse(data.data) };
                    } catch {}
                }

                NotificationNavigation.handleTap({
                    type: normalizedType,
                    data: parsedParams,
                }, tapId);
            }
        );

        return () => {
            foregroundListener.current?.remove();
            responseListener.current?.remove();
        };
    }, [addNotification]);
};
