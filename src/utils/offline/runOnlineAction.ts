import type { AppError } from "@/src/api/errors";
import { reportActionError, type NetworkFeedbackOptions } from "./networkFeedback";
import { requireInternet } from "./requireInternet";

export type OnlineActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; reason: "offline" | "busy"; error?: undefined }
  | { ok: false; reason: "error"; error: AppError };

export interface RunOnlineActionOptions extends NetworkFeedbackOptions {
  /** Overrides the default copy for a failure (not for the offline case). */
  message?: string;
  /** Internal: useOnlineAction already gated, so don't gate twice. */
  preflight?: boolean;
}

/**
 * Runs an internet-dependent action behind the standard offline gate and error
 * reporting. It never throws and never starts work while offline, so a caller is
 * a single branch:
 *
 *   const res = await runOnlineAction(() => api.save(payload));
 *   if (!res.ok) return;
 *
 * Screens should prefer useOnlineAction, which adds the pending flag and the
 * duplicate-tap guard on top of this.
 */
export async function runOnlineAction<T>(
  action: () => Promise<T>,
  opts: RunOnlineActionOptions = {},
): Promise<OnlineActionResult<T>> {
  const { preflight = true, message, ...feedback } = opts;

  if (preflight && !requireInternet(feedback)) {
    return { ok: false, reason: "offline" };
  }

  try {
    return { ok: true, data: await action() };
  } catch (err) {
    return {
      ok: false,
      reason: "error",
      error: reportActionError(err, { ...feedback, message }),
    };
  }
}
