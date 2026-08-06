import { AppError } from "@/src/api/errors";
import { useNetworkStore } from "@/src/store/useNetworkStore";
import { useToastStore } from "@/src/store/toastStore";

/**
 * User-facing copy for a failed cart write. Raw backend messages must never reach
 * the toast — they leak internal detail and read as gibberish.
 */
export const cartErrorMessage = (err: unknown): string => {
  const kind = err instanceof AppError ? err.kind : "unknown";

  switch (kind) {
    case "network":
      return "No internet connection. Check your connection and try again.";
    case "timeout":
      return "That took too long. Please try again.";
    case "unauthorized":
    case "forbidden":
      return "Your session has expired. Please log in and try again.";
    case "not_found":
      return "This item is no longer available.";
    case "validation":
      return "We couldn't update this item. Please try again.";
    case "server":
      return "We couldn't reach our servers. Please try again in a moment.";
    default:
      return "We couldn't update your cart. Please try again.";
  }
};

/** Reports a failed cart write, unless the offline dialog is already saying it. */
export const notifyCartError = (err: unknown): void => {
  if (useNetworkStore.getState().offlineAlertVisible) return;
  useToastStore.getState().show(cartErrorMessage(err), "error");
};
