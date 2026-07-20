import { isExpoGo } from "@/src/utils/environment";
import type * as CrashlyticsModule from "@react-native-firebase/crashlytics";

// Crashlytics is a native module unavailable in Expo Go — even importing
// `@react-native-firebase/crashlytics` triggers a native module lookup at
// load time, so it's only required lazily, after the isExpoGo check below.
const crashlytics = (): typeof CrashlyticsModule =>
  require("@react-native-firebase/crashlytics");

// Collect crashes in all environments (development and production)
// as requested. Tag every report with `environment` so dev-time test
// crashes can be filtered out from real production crashes in the
// Firebase console (filter by the "environment" custom key).
const instance = isExpoGo ? null : crashlytics().getCrashlytics();
if (instance) {
  crashlytics().setCrashlyticsCollectionEnabled(instance, true);
  crashlytics().setAttribute(instance, "environment", __DEV__ ? "development" : "production");
}

export function reportError(error: unknown, context?: string) {
  if (!instance) return;
  if (context) crashlytics().log(instance, context);
  crashlytics().recordError(instance, error instanceof Error ? error : new Error(String(error)));
}

/**
 * Catches uncaught JS exceptions and unhandled promise rejections app-wide
 * and forwards them to Crashlytics before falling back to the default
 * handler (red box in dev, crash in production). Call once at app startup.
 */
export function initCrashReporting() {
  if (isExpoGo) return;
  const defaultHandler = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    reportError(error, isFatal ? "fatal" : "non-fatal");
    defaultHandler(error, isFatal);
  });
}
