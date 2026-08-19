const { withAndroidManifest } = require("expo/config-plugins");

const META_NAME = "com.google.firebase.messaging.default_notification_color";

/** Resolves default_notification_color manifest merge clash between expo-notifications and firebase-messaging. Runs last (runs in reverse order) by listing it first in app.config.ts. */
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
