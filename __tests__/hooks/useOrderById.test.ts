import { getOrderRefetchInterval } from "@/src/features/orders/hooks/useOrderById";

describe("getOrderRefetchInterval — order tracking live polling", () => {
  it("stops polling once the order is cancelled", () => {
    expect(getOrderRefetchInterval(0)).toBe(false);
  });

  it("stops polling once the order is delivered", () => {
    expect(getOrderRefetchInterval(7)).toBe(false);
  });

  it("polls every 30s for every non-terminal status", () => {
    [1, 2, 3, 4, 5, 6, 8, 9, 10].forEach((status) => {
      expect(getOrderRefetchInterval(status)).toBe(30_000);
    });
  });

  it("polls when the status is not yet known", () => {
    expect(getOrderRefetchInterval(undefined)).toBe(30_000);
  });
});
