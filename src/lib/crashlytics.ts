import {
  getCrashlytics,
  log,
  recordError,
  setAttribute,
  setCrashlyticsCollectionEnabled,
} from "@react-native-firebase/crashlytics";

const instance = getCrashlytics();

// Collect crashes in all environments (development and production)
// as requested. Tag every report with `environment` so dev-time test
// crashes can be filtered out from real production crashes in the
// Firebase console (filter by the "environment" custom key).
setCrashlyticsCollectionEnabled(instance, true);
setAttribute(instance, "environment", __DEV__ ? "development" : "production");

export function reportError(error: unknown, context?: string) {
  if (context) log(instance, context);
  recordError(instance, error instanceof Error ? error : new Error(String(error)));
}

/**
 * Catches uncaught JS exceptions and unhandled promise rejections app-wide
 * and forwards them to Crashlytics before falling back to the default
 * handler (red box in dev, crash in production). Call once at app startup.
 */
export function initCrashReporting() {
  const defaultHandler = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    reportError(error, isFatal ? "fatal" : "non-fatal");
    defaultHandler(error, isFatal);
  });
}
