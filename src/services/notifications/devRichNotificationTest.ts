import { Image } from "react-native";
import { HOME_IMAGES } from "../../constants/images";
import { RichCampaignHandler } from "./handlers/richCampaignNotification";
import { logger } from "@/src/utils/logger";
import { NotificationData, RichCampaignNotificationData } from "../../types/notification";

/**
 * DEV-ONLY test trigger for the custom Apollo-style rich notification — no FCM needed.
 * From the Metro/DevTools JS console run:
 *
 *   testRichNotification()
 *   testRichNotification({ imageUrl: "https://broken.example/x.png" }) // image fallback
 *   testRichNotification({ expiresAt: Date.now() + 8 * 3600 * 1000 })  // countdown test
 *
 * Stripped from release builds by the __DEV__ guard.
 */
if (__DEV__) {
  const defaultPayload: RichCampaignNotificationData = {
    notificationType: "rich_campaign",
    notificationId: "apollo_promo_test",
    title: "Don't Miss Your Medicine",
    body: "Your healthcare essentials are waiting. Order now and save more with CareSure Cover.",
    imageUrl: Image.resolveAssetSource(HOME_IMAGES.medicineStrip).uri,
    expiresAt: Date.now() + 8 * 60 * 60 * 1000 + 25 * 60 * 1000 + 30 * 1000, // 8h 25m 30s
    actionLabel: "Check Now",
    deepLink: "caresure://notifications",
    subText: "CareSure Offers",
  };

  (globalThis as Record<string, unknown>).testRichNotification = (
    overrides: Partial<RichCampaignNotificationData> = {},
  ) => {
    const merged = { ...defaultPayload, ...overrides };
    return RichCampaignHandler.display(merged as unknown as NotificationData).then(
      (shown: boolean) => {
        logger.debug(`[DevRichNotification] shown natively: ${shown}`);
        return shown;
      },
    );
  };
}

export {};
