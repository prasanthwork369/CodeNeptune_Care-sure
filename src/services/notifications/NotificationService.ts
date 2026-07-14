import { isExpoGo } from "@/src/utils/environment";
import { commerceBuilders } from "./builders/commerce";
import { healthBuilders } from "./builders/health";
import { systemBuilders } from "./builders/system";
import { modernUIBuilders } from "./builders/modernUI";
import { interactiveBuilders } from "./builders/interactive";

const getNotifee = () => require("@notifee/react-native");

let channelsReady = false;
async function ensurePlaygroundChannels(): Promise<any> {
  if (isExpoGo) return null;
  if (channelsReady) return getNotifee().default;
  
  const notifee = getNotifee().default;
  const { AndroidImportance } = getNotifee();
  
  await notifee.createChannel({
    id: "playground_basic",
    name: "Playground: Basic Notifications",
    importance: AndroidImportance.HIGH,
  });

  await notifee.createChannel({
    id: "playground_reminders",
    name: "Playground: Reminders",
    importance: AndroidImportance.HIGH,
  });

  await notifee.createChannel({
    id: "playground_progress",
    name: "Playground: Progress & Downloads",
    importance: AndroidImportance.DEFAULT,
    vibration: false,
    playSound: false,
  });

  channelsReady = true;
  return notifee;
}

export const NotificationService = {
  ensureChannels: ensurePlaygroundChannels,
  commerce: commerceBuilders,
  health: healthBuilders,
  system: systemBuilders,
  modernUI: modernUIBuilders,
  interactive: interactiveBuilders,

  // Generic trigger display
  display: async (notification: any) => {
    if (isExpoGo) return null;
    const notifee = await ensurePlaygroundChannels();
    const id = await notifee.displayNotification(notification);
    return id;
  },

  // Cancel specific notification
  cancel: async (id: string) => {
    if (isExpoGo) return;
    const notifee = getNotifee().default;
    await notifee.cancelNotification(id);
  },

  // Cancel all notifications
  cancelAll: async () => {
    if (isExpoGo) return;
    const notifee = getNotifee().default;
    await notifee.cancelAllNotifications();
  },

  // Badge count example
  setBadgeCount: async (count: number) => {
    if (isExpoGo) return;
    const notifee = getNotifee().default;
    await notifee.setBadgeCount(count);
  },
};
