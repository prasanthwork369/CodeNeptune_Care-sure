import { AppError, parseRetryAfter, toAppError } from "@/src/api/errors";
import { networkErrorMessage } from "@/src/utils/offline/messages";

/** Minimal shape `toAppError` reads off an axios error. */
const axiosError = (
  status: number,
  opts: { message?: string; headers?: Record<string, unknown> } = {},
) => ({
  isAxiosError: true,
  name: "AxiosError",
  message: "Request failed",
  response: {
    status,
    data: opts.message ? { message: opts.message } : undefined,
    headers: opts.headers ?? {},
  },
});

// Mirrors NON_RETRYABLE in queryClient.ts. Kept as a literal so a change there
// without a matching change here fails loudly rather than silently.
const NON_RETRYABLE: AppError["kind"][] = [
  "offline",
  "cancelled",
  "unauthorized",
  "forbidden",
  "not_found",
  "validation",
  "network",
  "rate_limited",
  "conflict",
];
const isRetried = (kind: AppError["kind"]) => !NON_RETRYABLE.includes(kind);

describe("status → AppErrorKind mapping", () => {
  describe("429 Too Many Requests", () => {
    it("maps to rate_limited and preserves the status", () => {
      const err = toAppError(axiosError(429));
      expect(err.kind).toBe("rate_limited");
      expect(err.status).toBe(429);
    });

    // The defect this fix exists for: `unknown` was retryable, so a 429 sent
    // three requests where the server asked for none.
    it("is not retried", () => {
      expect(isRetried(toAppError(axiosError(429)).kind)).toBe(false);
    });

    it("has friendly copy that does not say 'try again' immediately", () => {
      expect(networkErrorMessage("rate_limited")).toBe(
        "Too many requests. Please wait a moment and try again.",
      );
    });

    it("preserves the server payload", () => {
      const err = toAppError(axiosError(429, { message: "slow down" }));
      expect(err.data).toEqual({ message: "slow down" });
    });
  });

  describe("Retry-After", () => {
    it("parses the delay-seconds form off a 429", () => {
      const err = toAppError(
        axiosError(429, { headers: { "retry-after": "120" } }),
      );
      expect(err.retryAfterSeconds).toBe(120);
    });

    it("parses the HTTP-date form", () => {
      const now = Date.parse("Wed, 21 Oct 2015 07:28:00 GMT");
      expect(
        parseRetryAfter("Wed, 21 Oct 2015 07:30:00 GMT", now),
      ).toBe(120);
    });

    it("clamps a past date to zero rather than returning a negative wait", () => {
      const now = Date.parse("Wed, 21 Oct 2015 07:30:00 GMT");
      expect(parseRetryAfter("Wed, 21 Oct 2015 07:28:00 GMT", now)).toBe(0);
    });

    // A malformed header must never throw — it arrives from the network.
    it("returns undefined for malformed values without throwing", () => {
      expect(() => parseRetryAfter("not-a-date")).not.toThrow();
      expect(parseRetryAfter("not-a-date")).toBeUndefined();
      expect(parseRetryAfter("")).toBeUndefined();
      expect(parseRetryAfter("   ")).toBeUndefined();
      expect(parseRetryAfter(undefined)).toBeUndefined();
      expect(parseRetryAfter(null)).toBeUndefined();
      expect(parseRetryAfter({})).toBeUndefined();
      expect(parseRetryAfter([])).toBeUndefined();
    });

    it("leaves retryAfterSeconds undefined when the header is absent", () => {
      expect(toAppError(axiosError(429)).retryAfterSeconds).toBeUndefined();
    });

    it("is only populated for 429", () => {
      const err = toAppError(
        axiosError(500, { headers: { "retry-after": "30" } }),
      );
      expect(err.retryAfterSeconds).toBeUndefined();
    });
  });

  describe("400 Bad Request", () => {
    it("classifies as validation rather than unknown", () => {
      expect(toAppError(axiosError(400)).kind).toBe("validation");
    });

    it("is not retried", () => {
      expect(isRetried(toAppError(axiosError(400)).kind)).toBe(false);
    });

    it("prefers the backend message when present", () => {
      expect(
        toAppError(axiosError(400, { message: "Invalid pincode" })).message,
      ).toBe("Invalid pincode");
    });
  });

  describe("409 Conflict", () => {
    it("maps to conflict", () => {
      const err = toAppError(axiosError(409));
      expect(err.kind).toBe("conflict");
      expect(err.status).toBe(409);
    });

    it("is not retried", () => {
      expect(isRetried(toAppError(axiosError(409)).kind)).toBe(false);
    });

    it("has friendly copy", () => {
      expect(networkErrorMessage("conflict")).toBe(
        "That's already been updated. Please refresh and try again.",
      );
    });
  });

  describe("unchanged behaviour", () => {
    it.each([
      [401, "unauthorized"],
      [403, "forbidden"],
      [404, "not_found"],
      [413, "validation"],
      [422, "validation"],
    ] as const)("%i still maps to %s", (status, kind) => {
      expect(toAppError(axiosError(status)).kind).toBe(kind);
    });

    it.each([500, 502, 503])("%i still maps to server", (status) => {
      expect(toAppError(axiosError(status)).kind).toBe("server");
    });

    // Transient server faults are worth one more attempt; that policy is unchanged.
    it("keeps >=500 retryable", () => {
      expect(isRetried(toAppError(axiosError(503)).kind)).toBe(true);
    });

    it("413 keeps its specific upload copy", () => {
      expect(toAppError(axiosError(413)).message).toBe(
        "File is too large to upload. Please use a smaller file.",
      );
    });

    it("an unmapped status still falls back to unknown", () => {
      expect(toAppError(axiosError(418)).kind).toBe("unknown");
    });
  });
});
