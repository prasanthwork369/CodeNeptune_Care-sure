const { withProjectBuildGradle } = require("@expo/config-plugins");

/**
 * notifee ships its native artifact `app.notifee:core` as a local Maven repo
 * inside `node_modules/@notifee/react-native/android/libs` rather than on a
 * public repo. Gradle can't find it otherwise (build fails with
 * "Could not find any matches for app.notifee:core:+"), so we register that
 * local repo in the project's allprojects.repositories block. As a config
 * plugin it survives every `expo prebuild`.
 */
const REPO_MARKER = "@notifee/react-native/android/libs";
const REPO_LINE =
  'maven { url "$rootDir/../node_modules/@notifee/react-native/android/libs" }';

module.exports = function withNotifeeRepo(config) {
  return withProjectBuildGradle(config, (cfg) => {
    if (cfg.modResults.language !== "groovy") return cfg;
    if (cfg.modResults.contents.includes(REPO_MARKER)) return cfg;
    cfg.modResults.contents = cfg.modResults.contents.replace(
      /allprojects\s*\{\s*repositories\s*\{/,
      (match) => `${match}\n        ${REPO_LINE}`,
    );
    return cfg;
  });
};
