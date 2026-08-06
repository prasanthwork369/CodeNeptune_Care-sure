import { orderErrorMessage } from "@/src/utils/orderError";
import { AppError } from "@/src/api/errors";
import { OFFLINE_MESSAGE } from "@/src/utils/offline";

describe("orderErrorMessage — Checkout Error Sanitization", () => {
  it("uses the one shared offline sentence for offline and network kinds", () => {
    expect(orderErrorMessage(new AppError("network", "Failed to connect"))).toBe(
      OFFLINE_MESSAGE,
    );
    expect(orderErrorMessage(new AppError("offline", "never sent"))).toBe(
      OFFLINE_MESSAGE,
    );
  });

  it("returns duplicate-prevention guidance for timeout errors", () => {
    const err = new AppError("timeout", "Request timed out");
    expect(orderErrorMessage(err)).toBe(
      "This is taking longer than usual. Please check My Orders before trying again — your order may already be placed.",
    );
  });

  it("returns session expired message for auth errors", () => {
    const err401 = new AppError("unauthorized", "Unauthorized");
    const err403 = new AppError("forbidden", "Forbidden");

    expect(orderErrorMessage(err401)).toBe(
      "Your session has expired. Please log in and try again.",
    );
    expect(orderErrorMessage(err403)).toBe(
      "Your session has expired. Please log in and try again.",
    );
  });

  it("returns cart item availability warning for validation or not_found errors", () => {
    const errValidation = new AppError("validation", "Out of stock");
    const errNotFound = new AppError("not_found", "Product missing");

    expect(orderErrorMessage(errValidation)).toBe(
      "Some items in your order are no longer available. Please review your cart and try again.",
    );
    expect(orderErrorMessage(errNotFound)).toBe(
      "Some items in your order are no longer available. Please review your cart and try again.",
    );
  });

  it("returns server reachability warning for 500 server errors", () => {
    const err500 = new AppError("server", "Internal Server Error");
    expect(orderErrorMessage(err500)).toBe(
      "We couldn't reach our servers. Please try again in a moment.",
    );
  });

  it("returns safe default fallback for unknown error types or raw JS errors", () => {
    expect(orderErrorMessage(new Error("Raw database error"))).toBe(
      "We couldn't place your order. Please try again.",
    );
    expect(orderErrorMessage(null)).toBe(
      "We couldn't place your order. Please try again.",
    );
  });
});
