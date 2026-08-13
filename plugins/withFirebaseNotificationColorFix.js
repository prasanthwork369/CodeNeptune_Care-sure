const { withAndroidManifest } = require("expo/config-plugins");

const META_NAME = "com.google.firebase.messaging.default_notification_color";

/**
 * Both `expo-notifications` and `@react-native-firebase/messaging` declare a
 * `com.google.firebase.messaging.default_notification_color` meta-data with
 * different values, which makes the Android manifest merger fail.
 *
 * This adds `tools:replace="android:resource"` to that meta-data so our color wins.
 *
 * IMPORTANT: keep this plugin listed FIRST in app.config.ts `plugins`. Manifest
 * mods run in reverse of listing order, so listing it first makes it run LAST —
 * after expo-notifications has injected the meta-data. Listed later, it would run
 * before that meta-data exists and silently tag nothing.
 */
module.exports = function withFirebaseNotificationColorFix(config) {
  return withAndroidManifest(config, (cfg) => {
    const application = cfg.modResults.manifest.application?.[0];
    if (!application) return cfg;

    for (const item of application["meta-data"] ?? []) {
      if (item.$?.["android:name"] === META_NAME) {
        item.$["tools:replace"] = "android:resource";
      }
    }
    return cfg;
  });
};
