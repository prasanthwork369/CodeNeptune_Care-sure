import { AppError } from "@/src/api/errors";
import { OFFLINE_MESSAGE } from "@/src/utils/offline/messages";

/**
 * User-facing copy for a failed order. Raw backend messages must never reach
 * the checkout alert — they leak internal detail and read as gibberish.
 */
export const orderErrorMessage = (err: unknown): string => {
  const kind = err instanceof AppError ? err.kind : "unknown";

  switch (kind) {
    case "offline":
    case "network":
      return OFFLINE_MESSAGE;
    // Never tell the user to simply retry: the order may have been created
    // before the request timed out, and a blind retry duplicates it.
    case "timeout":
      return "This is taking longer than usual. Please check My Orders before trying again — your order may already be placed.";
    case "unauthorized":
    case "forbidden":
      return "Your session has expired. Please log in and try again.";
    case "validation":
    case "not_found":
      return "Some items in your order are no longer available. Please review your cart and try again.";
    case "server":
      return "We couldn't reach our servers. Please try again in a moment.";
    default:
      return "We couldn't place your order. Please try again.";
  }
};
