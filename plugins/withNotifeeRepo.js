const { withProjectBuildGradle } = require("expo/config-plugins");

/** Registers Notifee's local Maven repository path in project build.gradle to prevent build failures. */
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
