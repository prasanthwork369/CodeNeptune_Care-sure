import { isExpoGo } from "../../../utils/environment";
import { logger } from "@/src/utils/logger";
// Type-only, so it never pulls the native module into the Expo Go bundle.
import type { FirebaseMessagingTypes } from "@react-native-firebase/messaging";

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
  const {
    getMessaging,
    setBackgroundMessageHandler,
  } = require("@react-native-firebase/messaging");
  setBackgroundMessageHandler(
    getMessaging(),
    async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
      if (__DEV__)
        logger.debug("[BackgroundMessage]", JSON.stringify(remoteMessage));
      if (!remoteMessage?.notification) {
        const {
          notificationService,
        } = require("../../notifications/notificationService");
        await notificationService.handleIncomingMessage(remoteMessage).catch(() => {});
      }
    },
  );
}
