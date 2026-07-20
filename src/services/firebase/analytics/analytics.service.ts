import { isExpoGo } from "@/src/utils/environment";

type EventParams = Record<string, string | number | boolean | undefined>;

const getAnalytics = () => {
  if (isExpoGo) return null;
  try {
    return require("@react-native-firebase/analytics").default;
  } catch {
    return null;
  }
};

const log = async (name: string, params?: EventParams) => {
  const analytics = getAnalytics();
  if (!analytics) return;

  const safeParams = params
    ? Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== undefined),
      )
    : undefined;

  try {
    await analytics().logEvent(name, safeParams);
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
    log("product_view", { source_type: sourceType == null ? undefined : String(sourceType) }),

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
};
