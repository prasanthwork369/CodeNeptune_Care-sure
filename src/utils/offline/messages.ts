import type { AppErrorKind } from "@/src/api/errors";

/**
 * The one offline sentence used app-wide — banner, toast and modal all read the
 * same. Never inline this copy at a call site.
 */
export const OFFLINE_MESSAGE =
  "No internet connection. Please check your network and try again.";

/**
 * Default user-facing copy for a failed action. Domain mappers (cartErrorMessage,
 * orderErrorMessage) override this where the wording needs to be specific; raw
 * backend messages must never reach the user.
 */
export const networkErrorMessage = (kind: AppErrorKind): string => {
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
      return "That's no longer available.";
    case "validation":
      return "Please check the details and try again.";
    case "server":
      return "We couldn't reach our servers. Please try again in a moment.";
    default:
      return "Something went wrong. Please try again.";
  }
};
