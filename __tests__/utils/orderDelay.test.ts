import { getCancellationReason, isOrderDelayed } from "@/src/utils/orderDelay";

describe("isOrderDelayed", () => {
  it("is false when there is no estimated delivery date", () => {
    expect(isOrderDelayed({ status: 4, estimatedDelivery: undefined })).toBe(
      false,
    );
  });

  it("is false when the estimated delivery date is in the future", () => {
    const future = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    expect(isOrderDelayed({ status: 4, estimatedDelivery: future })).toBe(
      false,
    );
  });

  it("is true when the estimated delivery date has passed and the order is still in progress", () => {
    const past = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    expect(isOrderDelayed({ status: 6, estimatedDelivery: past })).toBe(true);
  });

  it("is false for a delivered order even if the ETA is in the past", () => {
    const past = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    expect(isOrderDelayed({ status: 7, estimatedDelivery: past })).toBe(
      false,
    );
  });

  it("is false for a cancelled order even if the ETA is in the past", () => {
    const past = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    expect(isOrderDelayed({ status: 0, estimatedDelivery: past })).toBe(
      false,
    );
  });
});

describe("getCancellationReason", () => {
  it("is null when the order is not cancelled", () => {
    expect(
      getCancellationReason({
        status: 4,
        statusLogs: [
          {
            id: "log-1",
            orderId: "order-1",
            fromStatus: "1",
            toStatus: "0",
            reason: "Out of stock",
            createdAt: "2026-01-01T00:00:00Z",
          },
        ],
      }),
    ).toBeNull();
  });

  it("returns the reason recorded on the cancellation status log", () => {
    expect(
      getCancellationReason({
        status: 0,
        statusLogs: [
          {
            id: "log-1",
            orderId: "order-1",
            fromStatus: "1",
            toStatus: "0",
            reason: "  Out of stock  ",
            createdAt: "2026-01-01T00:00:00Z",
          },
        ],
      }),
    ).toBe("Out of stock");
  });

  it("is null when cancelled but no matching status log has a reason", () => {
    expect(
      getCancellationReason({
        status: 0,
        statusLogs: [
          {
            id: "log-1",
            orderId: "order-1",
            fromStatus: "1",
            toStatus: "0",
            reason: null,
            createdAt: "2026-01-01T00:00:00Z",
          },
        ],
      }),
    ).toBeNull();
  });

  it("is null when cancelled but there are no status logs at all", () => {
    expect(getCancellationReason({ status: 0, statusLogs: undefined })).toBeNull();
  });
});
