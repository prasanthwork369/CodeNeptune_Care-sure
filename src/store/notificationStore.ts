import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NotificationData } from "../types/notification";

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
  lastSeenRxId: string | null;
  lastSeenRxStatus: string | null;
  // Home badge stability: a background refetch/socket invalidation may only
  // raise displayedUnreadCount. It may drop only once allowUnreadCountDecrease
  // has been armed by an explicit user action (mark-read/dismiss/viewing the
  // notifications screen) — otherwise a stale or in-flight server value would
  // silently shrink a badge the user never acted on.
  displayedUnreadCount: number;
  allowUnreadCountDecrease: boolean;
  // Same rule for the prescription-banner badge bit: it may switch on for a
  // newly detected unread item, but only setLastSeenRx/clearRxUnreadDisplay
  // (both explicit user actions) may switch it back off.
  displayedRxUnread: boolean;
  add: (
    notification: Omit<AppNotification, "id" | "receivedAt" | "isRead">,
  ) => void;
  clear: () => void;
  setLastSeenRx: (id: string, status: string) => void;
  syncUnreadCount: (rawCount: number) => void;
  permitUnreadCountDecrease: () => void;
  syncRxUnread: (raw: boolean) => void;
  clearRxUnreadDisplay: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [],
      lastSeenRxId: null,
      lastSeenRxStatus: null,
      displayedUnreadCount: 0,
      allowUnreadCountDecrease: false,
      displayedRxUnread: false,

      add: (notification) => {
        const newItem: AppNotification = {
          ...notification,
          id: Date.now().toString(),
          receivedAt: new Date().toISOString(),
          isRead: false,
        };
        set((s) => ({
          notifications: [newItem, ...s.notifications].slice(0, 50),
        }));
      },

      clear: () => set({ notifications: [] }),

      setLastSeenRx: (id, status) =>
        set({
          lastSeenRxId: id,
          lastSeenRxStatus: status,
          displayedRxUnread: false,
        }),

      syncUnreadCount: (rawCount) =>
        set((s) => {
          if (rawCount >= s.displayedUnreadCount || s.allowUnreadCountDecrease) {
            return {
              displayedUnreadCount: rawCount,
              allowUnreadCountDecrease: false,
            };
          }
          return {};
        }),

      permitUnreadCountDecrease: () => set({ allowUnreadCountDecrease: true }),

      syncRxUnread: (raw) =>
        set((s) => (raw && !s.displayedRxUnread ? { displayedRxUnread: true } : {})),

      clearRxUnreadDisplay: () => set({ displayedRxUnread: false }),
    }),
    {
      name: "caresure-notifications",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
