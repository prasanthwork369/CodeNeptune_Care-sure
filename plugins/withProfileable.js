const { withAndroidManifest } = require("expo/config-plugins");

const TOOLS_NS = "http://schemas.android.com/tools";

/** Adds <profileable android:shell="true" /> to the Android manifest to allow Android Studio Profiling on release builds. */
module.exports = function withProfileable(config) {
  return withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults.manifest;
    const application = manifest.application?.[0];
    if (!application) return cfg;

    // Declare tools namespace if missing
    manifest.$ = manifest.$ ?? {};
    if (!manifest.$["xmlns:tools"]) manifest.$["xmlns:tools"] = TOOLS_NS;

    // Silence API level warnings on older minSdk versions
    application.profileable = [
      { $: { "android:shell": "true", "tools:targetApi": "q" } },
    ];
    return cfg;
  });
};
