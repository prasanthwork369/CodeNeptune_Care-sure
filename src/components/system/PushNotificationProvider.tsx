import { usePushNotifications } from "@/src/hooks/system/usePushNotifications";

export const PushNotificationProvider = () => {
  usePushNotifications();
  return null;
};
