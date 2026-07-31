import { isExpoGo } from "../../../utils/environment";
import { logger } from "@/src/utils/logger";

/**
 * Registers the Firebase background/quit-state message handler.
 *
 * This MUST run at module scope from the app entry (index.js), not inside a
 * React component — Android launches a headless JS task for background/killed
 * messages, and only entry-level code runs there.
 *
 * Messages WITH a `notification` block are displayed by the OS automatically —
 * we leave those alone. `data`-only messages are NOT auto-displayed, so we
 * render them ourselves via notifee to show the CareSure colour large icon
 * (the industry pattern for branded notifications). Gating on `!notification`
 * guarantees we never double up with an OS-shown notification.
 *
 * Firebase + notifee are native modules absent in Expo Go, so we guard +
 * lazy-require them.
 */
if (!isExpoGo) {
  const messaging = require("@react-native-firebase/messaging").default;
  messaging().setBackgroundMessageHandler(async (remoteMessage: any) => {
    if (__DEV__)
      logger.debug("[BackgroundMessage]", JSON.stringify(remoteMessage));
    if (!remoteMessage?.notification) {
      // Marketing product offers get the custom RemoteViews layout; anything
      // else (or a native failure) falls through to the branded notification.
      const {
        showProductOffer,
      } = require("../../notifications/productOfferNotification");
      const shown = await showProductOffer(remoteMessage?.data).catch(
        () => false,
      );
      if (shown) return;
      const { notifeeService } = require("../../notifications/notifeeService");
      await notifeeService.displayBranded(remoteMessage).catch(() => {});
    }
  });
}
