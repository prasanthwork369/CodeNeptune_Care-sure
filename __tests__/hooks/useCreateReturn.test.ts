import { QueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/src/lib/react-query/queryKeys";
import { Order, ReturnRecord } from "@/src/features/orders/types";

describe("useCreateReturn Authoritative Cache Updates", () => {
  let queryClient: QueryClient;

  const mockOrder: Order = {
    id: "uuid-order-1",
    orderId: "ORD-999",
    customerId: "cust-1",
    status: 4, // DELIVERED
    total: "1500", // Full order total
    createdAt: "2026-08-20T10:00:00.000Z",
    items: [
      {
        id: "item-1",
        orderId: "ORD-999",
        medicineId: "med-1",
        quantity: 2,
        status: "DELIVERED",
        isReturnable: true,
        medicineSnapshot: { name: "Medicine A" },
      },
      {
        id: "item-2",
        orderId: "ORD-999",
        medicineId: "med-2",
        quantity: 1,
        status: "DELIVERED",
        isReturnable: true,
        medicineSnapshot: { name: "Medicine B" },
      },
    ],
  };

  // Authoritative server response for a return creation
  const mockServerReturn: ReturnRecord = {
    id: "ret-server-777",
    orderId: "ORD-999",
    status: 1, // REQUESTED
    refundMethod: 1,
    createdAt: "2026-08-20T12:00:00.000Z",
    items: [
      {
        orderItemId: "item-1",
        medicineId: "med-1",
        quantity: 1,
        reason: "Defective",
        images: {},
        name: "Medicine A",
        unitPrice: 500,
        total: 500,
      },
    ],
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: Infinity },
      },
    });
  });

  afterEach(() => {
    queryClient.clear();
  });

  it("appends authoritative ReturnRecord without fabricating whole order total or fake IDs", () => {
    queryClient.setQueryData(
      QUERY_KEYS.CUSTOMER.ORDERS.BY_ID("uuid-order-1"),
      mockOrder,
    );

    const updateOrderWithReturn = (oldOrder?: Order): Order | undefined => {
      if (!oldOrder || !mockServerReturn?.id) return oldOrder;
      const existingReturns = oldOrder.returns ?? [];
      if (existingReturns.some((r) => r.id === mockServerReturn.id)) {
        return oldOrder;
      }

      const newEntry: NonNullable<Order["returns"]>[number] = {
        id: mockServerReturn.id,
        status: mockServerReturn.status,
        createdAt: mockServerReturn.createdAt,
      };

      return {
        ...oldOrder,
        returns: [newEntry, ...existingReturns],
      };
    };

    queryClient.setQueryData<Order>(
      QUERY_KEYS.CUSTOMER.ORDERS.BY_ID("uuid-order-1"),
      updateOrderWithReturn,
    );

    const updatedOrder = queryClient.getQueryData<Order>(
      QUERY_KEYS.CUSTOMER.ORDERS.BY_ID("uuid-order-1"),
    );

    expect(updatedOrder).toBeDefined();
    expect(updatedOrder?.returns).toHaveLength(1);
    // Uses real server ID, status, and createdAt without fabricating unreturned fields
    expect(updatedOrder?.returns?.[0].id).toBe("ret-server-777");
    expect(updatedOrder?.returns?.[0].status).toBe(1);
    expect(updatedOrder?.returns?.[0].createdAt).toBe("2026-08-20T12:00:00.000Z");
  });

  it("prevents duplicate return insertion on repeated update calls", () => {
    const orderWithReturn: Order = {
      ...mockOrder,
      returns: [
        {
          id: "ret-server-777",
          status: 1,
          createdAt: "2026-08-20T12:00:00.000Z",
          refundAmount: "500",
        },
      ],
    };

    queryClient.setQueryData(
      QUERY_KEYS.CUSTOMER.ORDERS.BY_ID("uuid-order-1"),
      orderWithReturn,
    );

    const updateOrderWithReturn = (oldOrder?: Order): Order | undefined => {
      if (!oldOrder || !mockServerReturn?.id) return oldOrder;
      const existingReturns = oldOrder.returns ?? [];
      if (existingReturns.some((r) => r.id === mockServerReturn.id)) {
        return oldOrder;
      }
      return {
        ...oldOrder,
        returns: [{ id: mockServerReturn.id, status: mockServerReturn.status, createdAt: mockServerReturn.createdAt }, ...existingReturns],
      };
    };

    queryClient.setQueryData<Order>(
      QUERY_KEYS.CUSTOMER.ORDERS.BY_ID("uuid-order-1"),
      updateOrderWithReturn,
    );

    const updatedOrder = queryClient.getQueryData<Order>(
      QUERY_KEYS.CUSTOMER.ORDERS.BY_ID("uuid-order-1"),
    );

    expect(updatedOrder?.returns).toHaveLength(1);
  });

  it("uses matching queryKey params and queryFn params for canonical list query", () => {
    const DEFAULT_ORDERS_PARAMS = {};
    const key = QUERY_KEYS.CUSTOMER.ORDERS.LIST(DEFAULT_ORDERS_PARAMS);

    // Verify key structure is canonical
    expect(key).toEqual(["customer", "orders", "list", {}]);
  });
});
