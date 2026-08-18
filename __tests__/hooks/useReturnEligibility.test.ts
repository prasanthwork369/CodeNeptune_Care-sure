import { renderHook } from "@testing-library/react-native";
import { useReturnEligibility } from "@/src/features/orders/hooks/useReturnEligibility";
import { RETURN_STATUS } from "@/src/features/orders/constants/return-status";
import { Order, OrderItem } from "@/src/features/orders/types";

function makeItem(overrides: Partial<OrderItem> = {}): OrderItem {
  return {
    id: "item-1",
    orderId: "order-1",
    medicineId: "med-1",
    quantity: 1,
    status: "PENDING",
    ...overrides,
  };
}

function makeOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: "order-1",
    orderId: "CS-1",
    customerId: "cust-1",
    status: 7,
    total: "100",
    createdAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("useReturnEligibility", () => {
  it("shows nothing when the order isn't delivered yet", () => {
    const { result } = renderHook(() =>
      useReturnEligibility(
        makeOrder({
          status: 4,
          items: [makeItem({ isReturnable: true })],
        }),
      ),
    );

    expect(result.current.showRequestReturnButton).toBe(false);
    expect(result.current.showWindowExpiredMessage).toBe(false);
  });

  it("offers the return button when delivered and a returnable item's window is still open", () => {
    const future = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const { result } = renderHook(() =>
      useReturnEligibility(
        makeOrder({
          items: [makeItem({ isReturnable: true, returnDeadline: future })],
        }),
      ),
    );

    expect(result.current.hasActiveReturnRequest).toBe(false);
    expect(result.current.showRequestReturnButton).toBe(true);
    expect(result.current.showWindowExpiredMessage).toBe(false);
    expect(result.current.returnDeadlineLabel).not.toBeNull();
  });

  it("has no deadline label when the window is unknown or the button isn't shown", () => {
    const { result } = renderHook(() =>
      useReturnEligibility(makeOrder({ items: [] })),
    );

    expect(result.current.returnDeadlineLabel).toBeNull();
  });

  it("shows the expired message once the earliest returnable deadline has passed", () => {
    const past = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { result } = renderHook(() =>
      useReturnEligibility(
        makeOrder({
          items: [makeItem({ isReturnable: true, returnDeadline: past })],
        }),
      ),
    );

    expect(result.current.showRequestReturnButton).toBe(false);
    expect(result.current.showWindowExpiredMessage).toBe(true);
  });

  it("treats missing deadline data as unknown, not expired, and still offers the button", () => {
    const { result } = renderHook(() =>
      useReturnEligibility(
        makeOrder({
          items: [makeItem({ isReturnable: false })],
        }),
      ),
    );

    expect(result.current.showRequestReturnButton).toBe(true);
    expect(result.current.showWindowExpiredMessage).toBe(false);
  });

  it("treats an order with no items the same way — unknown window, not expired", () => {
    const { result } = renderHook(() =>
      useReturnEligibility(makeOrder({ items: [] })),
    );

    expect(result.current.showRequestReturnButton).toBe(true);
    expect(result.current.showWindowExpiredMessage).toBe(false);
  });

  it("hides both the button and the expired message while a return is active", () => {
    const future = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const { result } = renderHook(() =>
      useReturnEligibility(
        makeOrder({
          items: [makeItem({ isReturnable: true, returnDeadline: future })],
          returns: [{ id: "ret-1", status: RETURN_STATUS.REQUESTED }],
        }),
      ),
    );

    expect(result.current.hasActiveReturnRequest).toBe(true);
    expect(result.current.showRequestReturnButton).toBe(false);
    expect(result.current.showWindowExpiredMessage).toBe(false);
  });

  it("treats a rejected return as closed, falling back to the window check", () => {
    const future = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const { result } = renderHook(() =>
      useReturnEligibility(
        makeOrder({
          items: [makeItem({ isReturnable: true, returnDeadline: future })],
          returns: [{ id: "ret-1", status: RETURN_STATUS.REJECTED }],
        }),
      ),
    );

    expect(result.current.hasActiveReturnRequest).toBe(false);
    expect(result.current.showRequestReturnButton).toBe(true);
  });

  it("hides the button and expired message for corporate-generated orders", () => {
    const future = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const { result } = renderHook(() =>
      useReturnEligibility(
        makeOrder({
          items: [makeItem({ isReturnable: true, returnDeadline: future })],
          isCorporateGeneratedOrder: true,
        }),
      ),
    );

    expect(result.current.showRequestReturnButton).toBe(false);
    expect(result.current.showWindowExpiredMessage).toBe(false);
  });
});
