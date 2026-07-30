// Register the Firebase background message handler BEFORE the router boots, so
// it's in place when Android launches a headless task for a background/killed
// notification. Must stay above the expo-router entry import.
import "./src/services/firebase/messaging/backgroundHandler";
// notifee requires a background event handler registered at the root.
import "./src/services/notifications/notifeeBackgroundHandler";
import "expo-router/entry";
