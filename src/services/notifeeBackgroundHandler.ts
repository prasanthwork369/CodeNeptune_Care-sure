import { isExpoGo } from "../utils/environment";

/**
 * notifee requires a background event handler to be registered at the app root,
 * otherwise it throws when a background/killed event fires for a notifee
 * notification. We keep it minimal: background/killed tap routing is still owned
 * by the Firebase handlers (getInitialNotification / onNotificationOpenedApp),
 * so there's nothing to navigate here. notifee is a native module absent in
 * Expo Go, so we guard + lazy-require it.
 */
if (!isExpoGo) {
  const notifee = require("@notifee/react-native").default;
  notifee.onBackgroundEvent(async () => {
    // Intentionally empty — see note above.
  });
}
