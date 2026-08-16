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
  add: (
    notification: Omit<AppNotification, "id" | "receivedAt" | "isRead">,
  ) => void;
  clear: () => void;
  setLastSeenRx: (id: string, status: string) => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [],
      lastSeenRxId: null,
      lastSeenRxStatus: null,

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
        set({ lastSeenRxId: id, lastSeenRxStatus: status }),
    }),
    {
      name: "caresure-notifications",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
