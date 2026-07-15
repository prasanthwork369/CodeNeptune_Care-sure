import { isExpoGo } from "../../utils/environment";
import { handleNotificationAction } from "./notificationActions";

/**
 * notifee requires a background event handler to be registered at the app root,
 * otherwise it throws when a background/killed event fires for a notifee
 * notification.
 *
 * Background/killed *tap* routing is still owned by the Firebase handlers
 * (getInitialNotification / onNotificationOpenedApp), so there's nothing to
 * navigate here. Action *buttons* are notifee-only — Firebase never sees them —
 * so they are handled here, which is the usual case since the app is rarely open
 * when a notification arrives. notifee is a native module absent in Expo Go, so
 * we guard + lazy-require it.
 */
if (!isExpoGo) {
  const notifee = require("@notifee/react-native").default;
  const { EventType } = require("@notifee/react-native");

  notifee.onBackgroundEvent(
    async ({
      type,
      detail,
    }: {
      type: number;
      detail: { notification?: any; pressAction?: { id: string } };
    }) => {
      if (type !== EventType.ACTION_PRESS) return;
      const actionId = detail.pressAction?.id;
      if (!actionId) return;
      await handleNotificationAction(
        actionId,
        detail.notification?.id,
        detail.notification?.data,
      );
    },
  );
}
