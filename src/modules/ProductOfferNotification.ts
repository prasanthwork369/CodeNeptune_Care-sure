import { Platform } from "react-native";
import { requireOptionalNativeModule } from "expo-modules-core";
import { ProductOfferNotificationData } from "../types/notification";

// Optional: Android-only (see modules/native-notifications/expo-module.config.json),
// so it's absent on iOS/Expo Go — this returns null there instead of throwing.
// NativeNotifications is the module identity (it owns future notification
// designs beyond product offers too); `display` itself is unchanged.
const NativeNotifications = requireOptionalNativeModule<{
  display: (data: ProductOfferNotificationData) => Promise<boolean>;
}>("NativeNotifications");

/**
 * Bridge to the native Android product-offer notification renderer
 * (RemoteViews collapsed + expanded layout). Android-only; the module is
 * absent in Expo Go and on iOS, so callers must handle a false return by
 * falling back to the standard branded notification.
 */
export const displayProductOfferNotification = async (
  data: ProductOfferNotificationData,
): Promise<boolean> => {
  if (Platform.OS !== "android") return false;
  if (!NativeNotifications?.display) return false;
  await NativeNotifications.display(data);
  return true;
};
