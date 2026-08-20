import { Platform } from "react-native";
import { requireOptionalNativeModule } from "expo-modules-core";
import { RichCampaignNotificationData } from "../types/notification";

const NativeNotifications = requireOptionalNativeModule<{
  display: (data: unknown) => Promise<boolean>;
  displayRichNotification: (data: RichCampaignNotificationData) => Promise<boolean>;
}>("NativeNotifications");

/**
 * JS bridge to the native Android Apollo-style rich notification renderer
 * (RemoteViews custom collapsed + expanded layouts with native Chronometer countdown).
 * Used for local triggers, development testing, and foreground presentation.
 * Returns true when natively displayed, or false to trigger fallback.
 */
export const displayRichCampaignNotification = async (
  data: RichCampaignNotificationData,
): Promise<boolean> => {
  if (Platform.OS !== "android") return false;
  if (!NativeNotifications?.displayRichNotification) return false;
  try {
    await NativeNotifications.displayRichNotification(data);
    return true;
  } catch (err) {
    if (__DEV__) {
      console.warn("[RichCampaignNotification] Failed to display native notification:", err);
    }
    return false;
  }
};
