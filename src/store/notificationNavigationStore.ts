import { create } from 'zustand';
import { NotificationPayload } from '../types/notification';

interface NotificationNavigationState {
  pendingNotification: NotificationPayload | null;
  lastHandledTapId: string | null;
  setPendingNotification: (notification: NotificationPayload | null) => void;
  clearPendingNotification: () => void;
  setLastHandledTapId: (id: string | null) => void;
}

export const useNotificationNavigationStore = create<NotificationNavigationState>((set) => ({
  pendingNotification: null,
  lastHandledTapId: null,
  setPendingNotification: (pendingNotification) => set({ pendingNotification }),
  clearPendingNotification: () => set({ pendingNotification: null }),
  setLastHandledTapId: (lastHandledTapId) => set({ lastHandledTapId }),
}));
