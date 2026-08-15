import { AppError } from "@/src/api/errors";
import { OFFLINE_MESSAGE } from "@/src/utils/offline/messages";
import { reportActionError } from "@/src/utils/offline/networkFeedback";

/**
 * User-facing copy for a failed cart write. Raw backend messages must never reach
 * the toast — they leak internal detail and read as gibberish.
 */
export const cartErrorMessage = (err: unknown): string => {
  const kind = err instanceof AppError ? err.kind : "unknown";

  switch (kind) {
    case "offline":
    case "network":
      return OFFLINE_MESSAGE;
    case "timeout":
      return "That took too long. Please try again.";
    case "unauthorized":
    case "forbidden":
      return "Your session has expired. Please log in and try again.";
    case "not_found":
      return "This item is no longer available.";
    case "validation":
      return "We couldn't update this item. Please try again.";
    // "Try again" is the wrong advice when the server asked us to slow down.
    case "rate_limited":
      return "Too many requests. Please wait a moment and try again.";
    case "server":
      return "We couldn't reach our servers. Please try again in a moment.";
    default:
      return "We couldn't update your cart. Please try again.";
  }
};

/** Reports a failed cart write through the shared feedback layer, with cart copy. */
export const notifyCartError = (err: unknown): void => {
  reportActionError(err, { message: cartErrorMessage(err) });
};
