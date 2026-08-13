import { isExpoGo } from "@/src/utils/environment";

type EventParams = Record<string, string | number | boolean | undefined>;

const isAnalyticsDisabled = isExpoGo || __DEV__;

// Native module absent in Expo Go — only required lazily, and always
// through the modular API (the namespaced `analytics()` call pattern this
// used before is deprecated).
const analyticsModule = (): typeof import("@react-native-firebase/analytics") =>
  require("@react-native-firebase/analytics");

const getAnalyticsInstance = () => {
  if (isAnalyticsDisabled) return null;
  try {
    return analyticsModule().getAnalytics();
  } catch {
    return null;
  }
};

// Explicitly toggle analytics data collection based on build environment
if (!isExpoGo) {
  try {
    const { getAnalytics, setAnalyticsCollectionEnabled } = analyticsModule();
    setAnalyticsCollectionEnabled(getAnalytics(), !isAnalyticsDisabled);
  } catch {
    // Ignore in non-native / test environments
  }
}

const log = async (name: string, params?: EventParams) => {
  const analytics = getAnalyticsInstance();
  if (!analytics) return;

  const safeParams = params
    ? Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== undefined),
      )
    : undefined;

  try {
    await analyticsModule().logEvent(analytics, name, safeParams);
  } catch (error) {
    // Telemetry must never affect a customer journey. Keep the failure visible
    // in development without sending data to a different destination.
    if (__DEV__) console.warn(`[Analytics] ${name} failed`, error);
  }
};

export const analyticsService = {
  logScreenView: (screenName: string) =>
    log("screen_view", { screen_name: screenName, screen_class: screenName }),

  logLoginSuccess: () => log("login", { method: "phone_otp" }),

  logSearchStarted: () => log("search_started"),

  logSearchCompleted: (resultCount: number) =>
    log("search_completed", { result_count: resultCount }),

  logProductView: (sourceType?: number | string) =>
    log("product_view", {
      source_type: sourceType == null ? undefined : String(sourceType),
    }),

  logAddToCart: () => log("add_to_cart"),

  logBeginCheckout: (itemCount: number, value: number) =>
    log("begin_checkout", { item_count: itemCount, value, currency: "INR" }),

  logPurchase: (transactionId: string, value: number, itemCount: number) =>
    log("purchase", {
      transaction_id: transactionId,
      value,
      currency: "INR",
      item_count: itemCount,
    }),

  // Answers "how many users are blocked right now?" — the first question asked
  // the day a forced update or maintenance window is switched on.
  logAppBlocked: (reason: "update" | "maintenance") =>
    log("app_blocked", { reason }),

  logSoftUpdatePrompt: (action: "shown" | "dismissed" | "accepted") =>
    log("soft_update_prompt", { action }),
};
