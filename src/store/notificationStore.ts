import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationData } from '../types/notification';

export interface AppNotification {
    id: string;
    title: string;
    body: string;
    data?: NotificationData;
    receivedAt: string;
    isRead: boolean;
}

interface NotificationState {
    notifications: AppNotification[];
    unreadCount: number;
    lastSeenRxId: string | null;
    lastSeenRxStatus: string | null;
    dismissedRxId: string | null;
    dismissedRxStatus: string | null;
    hasHydrated: boolean;
    add: (notification: Omit<AppNotification, 'id' | 'receivedAt' | 'isRead'>) => void;
    markAllRead: () => void;
    markRead: (id: string) => void;
    clear: () => void;
    setLastSeenRx: (id: string, status: string) => void;
    setDismissedRx: (id: string, status: string) => void;
    setHasHydrated: (value: boolean) => void;
}

export const useNotificationStore = create<NotificationState>()(
    persist(
        (set, get) => ({
            notifications: [],
            unreadCount: 0,
            lastSeenRxId: null,
            lastSeenRxStatus: null,
            dismissedRxId: null,
            dismissedRxStatus: null,
            hasHydrated: false,

            add: (notification) => {
                const newItem: AppNotification = {
                    ...notification,
                    id: Date.now().toString(),
                    receivedAt: new Date().toISOString(),
                    isRead: false,
                };
                set((s) => ({
                    notifications: [newItem, ...s.notifications].slice(0, 50),
                    unreadCount: s.unreadCount + 1,
                }));
            },

            markAllRead: () => set((s) => ({
                notifications: s.notifications.map(n => ({ ...n, isRead: true })),
                unreadCount: 0,
            })),

            markRead: (id) => set((s) => ({
                notifications: s.notifications.map(n => n.id === id ? { ...n, isRead: true } : n),
                unreadCount: Math.max(0, s.unreadCount - 1),
            })),

            clear: () => set({ notifications: [], unreadCount: 0 }),

            setLastSeenRx: (id, status) => set({ lastSeenRxId: id, lastSeenRxStatus: status }),

            setDismissedRx: (id, status) => set({ dismissedRxId: id, dismissedRxStatus: status }),

            setHasHydrated: (value) => set({ hasHydrated: value }),
        }),
        {
            name: 'caresure-notifications',
            storage: createJSONStorage(() => AsyncStorage),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);
