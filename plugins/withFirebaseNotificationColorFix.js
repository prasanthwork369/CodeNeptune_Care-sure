const { withAndroidManifest } = require("@expo/config-plugins");

/**
 * Both the `expo-notifications` plugin and `@react-native-firebase/messaging`
 * declare a `com.google.firebase.messaging.default_notification_color` meta-data
 * with different values, which makes the Android manifest merger fail.
 *
 * This plugin adds `tools:replace="android:resource"` to our meta-data so our
 * color wins, and survives every `expo prebuild` (unlike a manual manifest edit).
 */
module.exports = function withFirebaseNotificationColorFix(config) {
  return withAndroidManifest(config, (cfg) => {
    const application = cfg.modResults.manifest.application?.[0];
    if (!application) return cfg;

    const metaData = application["meta-data"] ?? [];
    for (const item of metaData) {
      if (
        item.$?.["android:name"] ===
        "com.google.firebase.messaging.default_notification_color"
      ) {
        item.$["tools:replace"] = "android:resource";
      }
    }

    return cfg;
  });
};
