import { AppError } from "@/src/api/errors";
import { OFFLINE_MESSAGE } from "./messages";
import { isOffline } from "./networkState";
import { reportOffline, type NetworkFeedbackOptions } from "./networkFeedback";

/**
 * The gate every internet-dependent action goes through. Returns false and reports
 * the standard offline feedback when there is no usable connection — the caller
 * must then return without starting a loader, calling an API or navigating.
 *
 *   if (!requireInternet()) return;                      // everyday action
 *   if (!requireInternet({ critical: true })) return;     // order / payment / upload
 */
export const requireInternet = (opts: NetworkFeedbackOptions = {}): boolean => {
  if (!isOffline()) return true;
  reportOffline(opts);
  return false;
};

/** Throwing variant, for use inside an async chain that already handles AppError. */
export const assertOnline = (): void => {
  if (isOffline()) throw new AppError("offline", OFFLINE_MESSAGE);
};
