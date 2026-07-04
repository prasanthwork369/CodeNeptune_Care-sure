import { isExpoGo } from '../utils/environment';

/**
 * Registers the Firebase background/quit-state message handler.
 *
 * This MUST run at module scope from the app entry (index.js), not inside a
 * React component — Android launches a headless JS task for background/killed
 * messages, and only entry-level code runs there.
 *
 * We keep the handler minimal: notification messages are displayed by the OS
 * automatically, so there's nothing to render here. It exists so Firebase stops
 * warning and so data-only messages have somewhere to be processed. Firebase is
 * a native module absent in Expo Go, so we guard + lazy-require it.
 */
if (!isExpoGo) {
  const messaging = require('@react-native-firebase/messaging').default;
  messaging().setBackgroundMessageHandler(async (remoteMessage: unknown) => {
    if (__DEV__) console.log('[BackgroundMessage]', JSON.stringify(remoteMessage));
  });
}
