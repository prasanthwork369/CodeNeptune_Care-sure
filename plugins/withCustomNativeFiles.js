const {
  withDangerousMod,
  withMainApplication,
  withAppBuildGradle,
} = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

// Custom ReactPackages the copied sources provide; injected into MainApplication.
// Fully-qualified names so no import edits are needed.
const CUSTOM_PACKAGES = [
  "com.codeneptune.caresure.TextInputFilterPackage()",
  "com.codeneptune.caresure.PhoneNumberHintPackage()",
  "com.codeneptune.caresure.notifications.ProductOfferNotificationPackage()",
];

// Gradle deps the copied sources need. PhoneNumberHintModule uses the Google
// Identity APIs (com.google.android.gms.auth.api.identity), which live in
// play-services-auth. Injected here so it survives `expo prebuild --clean`.
const CUSTOM_DEPENDENCIES = [
  'implementation("com.google.android.gms:play-services-auth:21.3.0")',
];

function copyRecursive(src, dest) {
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(to, { recursive: true });
      copyRecursive(from, to);
    } else {
      fs.copyFileSync(from, to);
    }
  }
}

/**
 * Copies the hand-written Android sources in native/android/ into the generated
 * android/ project on every prebuild, and registers their ReactPackages in
 * MainApplication. This is what lets `expo prebuild --clean` regenerate the
 * android folder without losing the custom native modules (TextInputFilter,
 * PhoneNumberHint, ProductOfferNotification). native/android/ is the canonical
 * source — edit there, never only in android/.
 */
module.exports = function withCustomNativeFiles(config) {
  config = withDangerousMod(config, [
    "android",
    (config) => {
      const src = path.join(config.modRequest.projectRoot, "native", "android");
      if (fs.existsSync(src)) {
        copyRecursive(src, config.modRequest.platformProjectRoot);
      }
      return config;
    },
  ]);

  config = withMainApplication(config, (config) => {
    let contents = config.modResults.contents;
    for (const pkg of CUSTOM_PACKAGES) {
      const line = `add(${pkg})`;
      // Idempotent: skip if this package (in any qualified/unqualified form) is present.
      const bareName = pkg.split(".").pop();
      if (contents.includes(`add(${bareName}`) || contents.includes(line)) continue;
      contents = contents.replace(
        /(PackageList\(this\)\.packages\.apply \{)/,
        `$1\n              ${line}`,
      );
    }
    config.modResults.contents = contents;
    return config;
  });

  config = withAppBuildGradle(config, (config) => {
    let contents = config.modResults.contents;
    for (const dep of CUSTOM_DEPENDENCIES) {
      if (contents.includes(dep)) continue;
      // Insert right after the first `dependencies {` (the app module's block).
      contents = contents.replace(/(dependencies\s*\{)/, `$1\n    ${dep}`);
    }
    config.modResults.contents = contents;
    return config;
  });

  return config;
};
