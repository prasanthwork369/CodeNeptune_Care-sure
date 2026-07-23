import { NativeModules, Platform } from "react-native";
import { ProductOfferNotificationData } from "../types/notification";

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
  const mod = NativeModules.ProductOfferNotification;
  if (!mod?.display) return false;
  await mod.display(data);
  return true;
};
