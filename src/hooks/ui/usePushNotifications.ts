import * as Notifications from 'expo-notifications';
import { useNav } from '@/src/hooks/useNav';
import { isExpoGo } from '@/src/utils/environment';
import { useEffect, useRef } from 'react';
import { notificationService } from '../../services/notification.service';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';

// Remote push notifications are unsupported in Expo Go (SDK 53+).
// Remove the `isExpoGo` check below once running via a development build.
export const usePushNotifications = () => {
    const router = useNav();
    const { isAuthenticated } = useAuthStore();
    const addNotification = useNotificationStore((s) => s.add);
    const responseListener = useRef<ReturnType<typeof Notifications.addNotificationResponseReceivedListener> | undefined>(undefined);
    const foregroundListener = useRef<ReturnType<typeof Notifications.addNotificationReceivedListener> | undefined>(undefined);

    useEffect(() => {
        notificationService.configureBehavior();
    }, []);

    useEffect(() => {
        if (!isAuthenticated) return;
        const timer = setTimeout(() => {
            notificationService.registerWithBackend();
        }, 1500);
        return () => clearTimeout(timer);
    }, [isAuthenticated]);

    useEffect(() => {
        if (isExpoGo) return;

        // Foreground notification received — save to store
        foregroundListener.current = Notifications.addNotificationReceivedListener(
            (notification) => {
                const { title, body, data } = notification.request.content;
                addNotification({
                    title: title ?? 'Notification',
                    body: body ?? '',
                    data: (data as Record<string, any>) ?? {},
                });
            }
        );

        // Notification tapped (foreground / background / killed)
        responseListener.current = Notifications.addNotificationResponseReceivedListener(
            (response) => {
                const data = response.notification.request.content.data as Record<string, any>;
                handleNotificationNavigation(data, router);
            }
        );

        return () => {
            foregroundListener.current?.remove();
            responseListener.current?.remove();
        };
    }, []);
};

function handleNotificationNavigation(data: Record<string, any>, router: ReturnType<typeof useNav>) {
    try {
        if (data?.screen === 'order' && data?.orderId) {
            router.push({ pathname: '/profile/orders/track', params: { orderId: data.orderId } } as any);
        } else if (data?.screen === 'product' && data?.productId) {
            router.push({ pathname: '/product/[id]', params: { id: data.productId } } as any);
        } else if (data?.screen === 'orders') {
            router.push('/profile/orders' as any);
        } else if (data?.screen === 'cart') {
            router.push('/(modal)/cart' as any);
        }
    } catch {}
}
