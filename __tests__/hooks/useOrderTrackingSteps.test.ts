import { renderHook } from "@testing-library/react-native";
import { useOrderTrackingSteps } from "@/src/features/orders/hooks/useOrderTrackingSteps";
import { RETURN_STATUS } from "@/src/features/orders/constants/return-status";
import { Order } from "@/src/features/orders/types";

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

describe("useOrderTrackingSteps", () => {
  it("builds the 7-step pipeline with no return steps when there are no returns", () => {
    const { result } = renderHook(() =>
      useOrderTrackingSteps(makeOrder({ status: 4 })),
    );

    expect(result.current).toHaveLength(7);
    expect(result.current[3].title).toBe("Processing");
    expect(result.current[3].isActive).toBe(true);
  });

  it("maps raw CHECKED (5) to the Processing step, not Packed", () => {
    const { result } = renderHook(() =>
      useOrderTrackingSteps(makeOrder({ status: 5 })),
    );

    expect(result.current[3].title).toBe("Processing");
    expect(result.current[3].isActive).toBe(true);
    expect(result.current[3].completed).toBe(true);
    expect(result.current[4].title).toBe("Packed");
    expect(result.current[4].completed).toBe(false);
    expect(result.current[4].isActive).toBe(false);
  });

  it("maps raw PACKED (14) to the Packed step as active and completed", () => {
    const { result } = renderHook(() =>
      useOrderTrackingSteps(makeOrder({ status: 14 })),
    );

    expect(result.current[4].title).toBe("Packed");
    expect(result.current[4].completed).toBe(true);
    expect(result.current[4].isActive).toBe(true);
    expect(result.current[5].completed).toBe(false);
  });

  it("maps raw PARTIALLY_PICKED (9) to the Processing step, same as PICKED/CHECKED", () => {
    const { result } = renderHook(() =>
      useOrderTrackingSteps(makeOrder({ status: 9 })),
    );

    expect(result.current[3].title).toBe("Processing");
    expect(result.current[3].isActive).toBe(true);
  });

  it("does not pulse the Delivered step as active once the order is delivered", () => {
    const { result } = renderHook(() =>
      useOrderTrackingSteps(makeOrder({ status: 7 })),
    );

    expect(result.current[6].title).toBe("Delivered");
    expect(result.current[6].completed).toBe(true);
    expect(result.current[6].isActive).toBe(false);
  });

  it("treats DISPATCHER_CANCEL (12) as a cancelled order, built from statusLogs", () => {
    const { result } = renderHook(() =>
      useOrderTrackingSteps(
        makeOrder({
          status: 12,
          statusLogs: [
            {
              id: "log-1",
              orderId: "order-1",
              fromStatus: null,
              toStatus: "1",
              createdAt: "2026-01-01T00:00:00Z",
            },
            {
              id: "log-2",
              orderId: "order-1",
              fromStatus: "1",
              toStatus: "12",
              createdAt: "2026-01-02T00:00:00Z",
            },
          ],
        }),
      ),
    );

    expect(result.current).toHaveLength(2);
    expect(result.current[1].cancelled).toBe(true);
    expect(result.current[1].title).toBe("Dispatch Cancelled");
  });

  it("does not append return steps when delivered but no return exists", () => {
    const { result } = renderHook(() =>
      useOrderTrackingSteps(makeOrder({ status: 7, returns: [] })),
    );

    expect(result.current).toHaveLength(7);
  });

  it("appends pending return steps when a return is only requested", () => {
    const { result } = renderHook(() =>
      useOrderTrackingSteps(
        makeOrder({
          status: 7,
          returns: [{ id: "ret-1", status: RETURN_STATUS.REQUESTED }],
        }),
      ),
    );

    expect(result.current).toHaveLength(9);
    const [pickedUp, refunded] = result.current.slice(7);
    expect(pickedUp.title).toBe("Item Picked Up");
    expect(pickedUp.completed).toBe(false);
    expect(pickedUp.isActive).toBe(false);
    expect(refunded.completed).toBe(false);
  });

  it("marks 'Item Picked Up' active once the return reaches that status", () => {
    const { result } = renderHook(() =>
      useOrderTrackingSteps(
        makeOrder({
          status: 7,
          returns: [{ id: "ret-1", status: RETURN_STATUS.PICKED_UP }],
        }),
      ),
    );

    const [pickedUp, refunded] = result.current.slice(7);
    expect(pickedUp.completed).toBe(true);
    expect(pickedUp.isActive).toBe(true);
    expect(refunded.completed).toBe(false);
    expect(refunded.isActive).toBe(false);
  });

  it("marks both return steps completed once the refund is completed", () => {
    const { result } = renderHook(() =>
      useOrderTrackingSteps(
        makeOrder({
          status: 7,
          returns: [{ id: "ret-1", status: RETURN_STATUS.COMPLETED }],
        }),
      ),
    );

    const [pickedUp, refunded] = result.current.slice(7);
    expect(pickedUp.completed).toBe(true);
    expect(refunded.completed).toBe(true);
    expect(refunded.isActive).toBe(true);
  });

  it("matches the web client's rejected-return handling: both steps still read as done", () => {
    const { result } = renderHook(() =>
      useOrderTrackingSteps(
        makeOrder({
          status: 7,
          returns: [{ id: "ret-1", status: RETURN_STATUS.REJECTED }],
        }),
      ),
    );

    const [pickedUp, refunded] = result.current.slice(7);
    expect(pickedUp.cancelled).toBe(false);
    expect(pickedUp.completed).toBe(true);
    expect(refunded.cancelled).toBe(false);
    expect(refunded.completed).toBe(true);
  });
});
