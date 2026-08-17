import { AppError, toAppError } from "@/src/api/errors";
import { useNetworkStore } from "@/src/store/useNetworkStore";
import { useToastStore } from "@/src/store/toastStore";
import { networkErrorMessage } from "./messages";
import { isOffline } from "./networkState";

/**
 * The single place that decides HOW a network problem is shown, so no screen
 * invents its own treatment.
 *
 * One signal per event:
 *
 *   offline / connection failure → the global banner only (NetworkToast). It is
 *       already on screen for the whole offline state and carries the Refresh
 *       action, so a toast or modal on top would be a second message about the
 *       same thing — in nearly the same screen position.
 *   any other failure (server, timeout, validation) → one error toast, since the
 *       banner says nothing about those.
 *
 * Repeats inside REPEAT_WINDOW_MS collapse into one toast, so hammering a button
 * never stacks messages.
 */
const REPEAT_WINDOW_MS = 2500;

let lastMessage = "";
let lastShownAt = 0;

const showToastOnce = (message: string): void => {
  const now = Date.now();
  if (message === lastMessage && now - lastShownAt < REPEAT_WINDOW_MS) return;
  lastMessage = message;
  lastShownAt = now;
  useToastStore.getState().show(message, "error");
};

/** Test seam — the de-dupe window is module state that outlives a test case. */
export const resetNetworkFeedback = (): void => {
  lastMessage = "";
  lastShownAt = 0;
};

export interface NetworkFeedbackOptions {
  /**
   * Raise the blocking modal on top of the banner. Reserved for a flow where the
   * user must acknowledge before continuing — everyday actions must not set it,
   * or the offline state gets narrated twice.
   */
  critical?: boolean;
  /** Caller renders its own inline error — report nothing. */
  silent?: boolean;
}

/**
 * Reports that an action was blocked because the device is offline. Silent unless
 * the caller marks the action critical: the banner is already on screen saying
 * exactly this, with a Refresh action attached.
 */
export const reportOffline = (opts: NetworkFeedbackOptions = {}): void => {
  if (opts.silent || !opts.critical) return;
  useNetworkStore.getState().showOfflineAlert();
};

/**
 * Reports a failed action. Cancellations stay silent — they are debounce/unmount
 * aborts, not failures the user caused or can fix.
 */
const BUSINESS_ERROR_KINDS: AppError["kind"][] = [
  "validation",
  "conflict",
  "not_found",
  "forbidden",
  "rate_limited",
];

export const reportActionError = (
  error: unknown,
  opts: NetworkFeedbackOptions & { message?: string } = {},
): AppError => {
  const appError = toAppError(error);
  if (appError.kind === "cancelled" || opts.silent) return appError;

  // If the offline alert dialog is already visible, avoid showing a toast over it.
  if (useNetworkStore.getState().offlineAlertVisible) return appError;

  // Connection failures when the device is truly offline belong to the banner.
  if (
    appError.kind === "offline" ||
    (appError.kind === "network" && isOffline())
  ) {
    reportOffline(opts);
    return appError;
  }

  // Preserve backend business messages for validation/conflict/not-found;
  // use sanitized standard copy for technical transport/server errors.
  const fallbackMessage = networkErrorMessage(appError.kind);
  const resolvedMessage =
    opts.message ||
    (BUSINESS_ERROR_KINDS.includes(appError.kind) && appError.message
      ? appError.message
      : fallbackMessage);

  showToastOnce(resolvedMessage);
  return appError;
};
