import { AxiosError } from "axios";
// messages.ts imports only the AppErrorKind *type* back, so this stays a
// type-only cycle and never becomes a runtime one.
import { OFFLINE_MESSAGE } from "@/src/utils/offline/messages";

export type AppErrorKind =
  // Device has no usable connection — the request never left.
  | "offline"
  // The request left but the connection failed (DNS, reset, unreachable host).
  | "network"
  | "timeout"
  // Aborted by us (debounce, unmount, replaced request) — never user-facing.
  | "cancelled"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "validation"
  // Server asked us to slow down. Retrying only makes it worse.
  | "rate_limited"
  // The request conflicts with current server state (duplicate, stale version).
  | "conflict"
  | "server"
  | "unknown";

export class AppError extends Error {
  kind: AppErrorKind;
  status?: number;
  data?: unknown;
  /** Seconds the server asked us to wait; only ever set for `rate_limited`. */
  retryAfterSeconds?: number;

  constructor(
    kind: AppErrorKind,
    message: string,
    status?: number,
    data?: unknown,
    retryAfterSeconds?: number,
  ) {
    super(message);
    this.name = "AppError";
    this.kind = kind;
    this.status = status;
    this.data = data;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

/**
 * Parses a `Retry-After` header. Accepts both documented forms — delay in
 * seconds, or an HTTP date — and returns undefined for anything unparseable,
 * so a malformed header can never throw or produce a nonsense wait.
 */
export function parseRetryAfter(
  raw: unknown,
  now: number = Date.now(),
): number | undefined {
  if (typeof raw !== "string" && typeof raw !== "number") return undefined;
  const value = String(raw).trim();
  if (!value) return undefined;

  // Delay-seconds form, e.g. "120".
  if (/^\d+$/.test(value)) {
    const seconds = Number(value);
    return Number.isFinite(seconds) ? seconds : undefined;
  }

  // HTTP-date form, e.g. "Wed, 21 Oct 2015 07:28:00 GMT".
  const at = Date.parse(value);
  if (Number.isNaN(at)) return undefined;
  // A date already in the past means "retry now", not a negative wait.
  return Math.max(0, Math.round((at - now) / 1000));
}

/** The fields catch blocks actually read off a thrown value. */
export type CaughtError = {
  message?: string;
  name?: string;
  code?: string;
  kind?: string; // AppError
  status?: number; // AppError
  data?: unknown;
  response?: {
    status?: number;
    data?: { message?: string; data?: unknown } & Record<string, unknown>;
  };
};

/** Views an `unknown` catch variable through CaughtError — every field stays optional. */
export const asError = (err: unknown): CaughtError =>
  (err ?? {}) as CaughtError;

const extractSafeMessage = (data: unknown, fallback: string): string => {
  if (typeof data === "object" && data !== null) {
    const msg =
      (data as { message?: unknown; error?: unknown }).message ??
      (data as { message?: unknown; error?: unknown }).error;
    if (typeof msg === "string") {
      const trimmed = msg.trim();
      if (
        trimmed &&
        !trimmed.startsWith("Request failed") &&
        !trimmed.includes("[object") &&
        !trimmed.startsWith("<!DOCTYPE")
      ) {
        return trimmed;
      }
    }
  }
  return fallback;
};

export function toAppError(err: unknown): AppError {
  if (err instanceof AppError) return err;

  const code = (err as { code?: unknown } | null)?.code;

  if (code === "NETWORK_OFFLINE") {
    return new AppError("offline", OFFLINE_MESSAGE);
  }

  // Axios aborts (ERR_CANCELED) and manual AbortController signals both land here.
  if (
    code === "ERR_CANCELED" ||
    (err as { name?: string } | null)?.name === "CanceledError"
  ) {
    return new AppError("cancelled", "Request cancelled");
  }

  if (isAxiosError(err)) {
    if (err.code === "ECONNABORTED" || err.code === "ETIMEDOUT") {
      return new AppError(
        "timeout",
        "Request timed out. Please try again.",
      );
    }
    // No response covers DNS failure, connection reset and unreachable host.
    if (!err.response) {
      return new AppError(
        "network",
        "Unable to reach server. Please try again.",
      );
    }
    const status = err.response.status;
    const data = err.response.data;

    if (status === 401)
      return new AppError(
        "unauthorized",
        "Your session has expired. Please log in and try again.",
        status,
        data,
      );
    if (status === 403)
      return new AppError(
        "forbidden",
        extractSafeMessage(data, "Access denied. Please try again."),
        status,
        data,
      );
    if (status === 404)
      return new AppError(
        "not_found",
        extractSafeMessage(data, "That's no longer available."),
        status,
        data,
      );
    if (status === 413)
      return new AppError(
        "validation",
        "File is too large to upload. Please use a smaller file.",
        status,
        data,
      );
    if (status === 400 || status === 422)
      return new AppError(
        "validation",
        extractSafeMessage(data, "Please check the details and try again."),
        status,
        data,
      );
    if (status === 409)
      return new AppError(
        "conflict",
        extractSafeMessage(
          data,
          "That's already been updated. Please refresh and try again.",
        ),
        status,
        data,
      );
    if (status === 429)
      return new AppError(
        "rate_limited",
        extractSafeMessage(
          data,
          "Too many requests. Please wait a moment and try again.",
        ),
        status,
        data,
        parseRetryAfter(err.response.headers?.["retry-after"]),
      );
    if (status >= 500)
      return new AppError(
        "server",
        "Server temporarily unavailable. Please try again in a moment.",
        status,
        data,
      );
    return new AppError(
      "unknown",
      extractSafeMessage(data, "Something went wrong. Please try again."),
      status,
      data,
    );
  }

  if (err instanceof Error) {
    return new AppError("unknown", err.message);
  }
  return new AppError("unknown", "Something went wrong");
}

function isAxiosError(err: unknown): err is AxiosError {
  return (
    typeof err === "object" &&
    err !== null &&
    (err as { isAxiosError?: boolean }).isAxiosError === true
  );
}
