import { isExpoGo } from "@/src/utils/environment";
import type * as CrashlyticsModule from "@react-native-firebase/crashlytics";

// Crashlytics is a native module unavailable in Expo Go — even importing
// `@react-native-firebase/crashlytics` triggers a native module lookup at
// load time, so it's only required lazily, after the isExpoGo check below.
const crashlytics = (): typeof CrashlyticsModule =>
  require("@react-native-firebase/crashlytics");

// Disable Crashlytics in Expo Go and Development / Metro / Debug builds (__DEV__).
// Crashlytics reporting is ONLY enabled for production / release builds (!__DEV__).
const isCrashlyticsDisabled = isExpoGo || __DEV__;
const instance = isCrashlyticsDisabled ? null : crashlytics().getCrashlytics();

if (instance) {
  crashlytics().setCrashlyticsCollectionEnabled(instance, true);
  crashlytics().setAttribute(instance, "environment", "production");
} else if (!isExpoGo) {
  // Explicitly disable collection at runtime in JS for dev builds
  try {
    const devInstance = crashlytics().getCrashlytics();
    if (devInstance) {
      crashlytics().setCrashlyticsCollectionEnabled(devInstance, false);
    }
  } catch (_) {
    // Ignore errors in dev environment
  }
}

export function reportError(error: unknown, context?: string) {
  if (!instance) return;
  if (context) crashlytics().log(instance, context);
  crashlytics().recordError(instance, error instanceof Error ? error : new Error(String(error)));
}

/**
 * Catches uncaught JS exceptions and unhandled promise rejections in production release builds
 * and forwards them to Crashlytics before falling back to default handling.
 * In development (__DEV__) or Expo Go, this is a no-op to allow standard RedBox / Metro error handling.
 */
export function initCrashReporting() {
  if (isCrashlyticsDisabled || !instance) return;
  const defaultHandler = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    reportError(error, isFatal ? "fatal" : "non-fatal");
    defaultHandler(error, isFatal);
  });
}
