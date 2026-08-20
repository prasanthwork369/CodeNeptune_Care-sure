import { QueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/src/lib/react-query/queryKeys";
import { Order } from "@/src/features/orders/types";

describe("Order Cache Seeding, Canonical Key, and Background Fetch Guarantee", () => {
  const clients: QueryClient[] = [];
  afterEach(() => {
    clients.forEach((c) => c.clear());
    clients.length = 0;
  });

  const makeClient = (defaultStaleTime = 60_000) => {
    const client = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: defaultStaleTime,
        },
      },
    });
    clients.push(client);
    return client;
  };

  const sampleOrder1: Order = {
    id: "ord-uuid-001",
    orderId: "ORD-001",
    customerId: "cust-1",
    status: 1, // Pending / New
    total: "499.00",
    createdAt: "2026-08-20T10:00:00Z",
    items: [],
  };

  const sampleDeliveredOrder: Order = {
    id: "ord-uuid-delivered",
    orderId: "ORD-DELIVERED",
    customerId: "cust-1",
    status: 7, // Delivered
    total: "199.00",
    createdAt: "2026-08-15T10:00:00Z",
    items: [],
  };

  const newOrder: Order = {
    id: "ord-uuid-002",
    orderId: "ORD-002",
    customerId: "cust-1",
    status: 1, // Pending
    total: "250.00",
    createdAt: "2026-08-20T11:00:00Z",
    items: [],
  };

  it("guarantees prefetchQuery calls queryFn even when setQueryData made cache fresh", async () => {
    // Client with long default staleTime (60s)
    const client = makeClient(60_000);
    const canonicalKey = QUERY_KEYS.CUSTOMER.ORDERS.LIST({});

    // 1. Seed the initial list and prepend newOrder (which sets dataUpdatedAt = Date.now())
    client.setQueryData(canonicalKey, [sampleOrder1]);
    const existingList = client.getQueryData<Order[]>(canonicalKey);
    if (Array.isArray(existingList)) {
      client.setQueryData<Order[]>(canonicalKey, [newOrder, ...existingList]);
    }

    // 2. QueryFn mock to track execution
    const queryFnMock = jest.fn().mockResolvedValue([newOrder, sampleOrder1]);

    // 3. prefetchQuery with explicit staleTime: 0
    await client.prefetchQuery({
      queryKey: canonicalKey,
      queryFn: queryFnMock,
      staleTime: 0,
    });

    // PROVEN: queryFn is called over the network despite setQueryData having just run!
    expect(queryFnMock).toHaveBeenCalledTimes(1);
  });

  it("calls queryFn on no-cache case when prefetchQuery runs", async () => {
    const client = makeClient(60_000);
    const canonicalKey = QUERY_KEYS.CUSTOMER.ORDERS.LIST({});

    const queryFnMock = jest.fn().mockResolvedValue([newOrder]);

    await client.prefetchQuery({
      queryKey: canonicalKey,
      queryFn: queryFnMock,
      staleTime: 0,
    });

    expect(queryFnMock).toHaveBeenCalledTimes(1);
    expect(client.getQueryData(canonicalKey)).toEqual([newOrder]);
  });

  it("keeps newOrder visible in cache while network refresh is pending", async () => {
    const client = makeClient(60_000);
    const canonicalKey = QUERY_KEYS.CUSTOMER.ORDERS.LIST({});

    client.setQueryData(canonicalKey, [sampleOrder1]);
    const existingList = client.getQueryData<Order[]>(canonicalKey);
    if (Array.isArray(existingList)) {
      client.setQueryData<Order[]>(canonicalKey, [newOrder, ...existingList]);
    }

    // Verify cache has newOrder immediately
    const immediateData = client.getQueryData<Order[]>(canonicalKey);
    expect(immediateData?.[0].id).toBe("ord-uuid-002");

    // Deferred promise simulating slow network
    let resolveNetwork: (val: Order[]) => void;
    const slowNetworkPromise = new Promise<Order[]>((resolve) => {
      resolveNetwork = resolve;
    });

    const prefetchPromise = client.prefetchQuery({
      queryKey: canonicalKey,
      queryFn: () => slowNetworkPromise,
      staleTime: 0,
    });

    // While network is in-flight, cache continues to serve newOrder at index 0
    const inFlightData = client.getQueryData<Order[]>(canonicalKey);
    expect(inFlightData?.[0].id).toBe("ord-uuid-002");
    expect(inFlightData).toHaveLength(2);

    // Settle network
    resolveNetwork!([newOrder, sampleOrder1]);
    await prefetchPromise;

    const settledData = client.getQueryData<Order[]>(canonicalKey);
    expect(settledData?.[0].id).toBe("ord-uuid-002");
  });

  it("seeds individual order detail cache with matching BY_ID key and marks stale for full background fetch", () => {
    const client = makeClient();

    client.setQueryData(
      QUERY_KEYS.CUSTOMER.ORDERS.BY_ID(newOrder.id),
      newOrder,
    );
    client.invalidateQueries({
      queryKey: QUERY_KEYS.CUSTOMER.ORDERS.BY_ID(newOrder.id),
    });

    const query = client
      .getQueryCache()
      .find({ queryKey: QUERY_KEYS.CUSTOMER.ORDERS.BY_ID(newOrder.id) });

    expect(query).toBeDefined();
    expect(query?.state.data).toEqual(newOrder);
    expect(query?.state.isInvalidated).toBe(true);
  });

  it("prepends new order to canonical default list and leaves filtered lists untouched", () => {
    const client = makeClient();
    const canonicalKey = QUERY_KEYS.CUSTOMER.ORDERS.LIST({});
    const deliveredKey = QUERY_KEYS.CUSTOMER.ORDERS.LIST({ status: "7" });

    client.setQueryData(canonicalKey, [sampleOrder1]);
    client.setQueryData(deliveredKey, [sampleDeliveredOrder]);

    const existingList = client.getQueryData<Order[]>(canonicalKey);
    if (Array.isArray(existingList)) {
      if (!existingList.some((o) => o.id === newOrder?.id)) {
        client.setQueryData<Order[]>(canonicalKey, [newOrder, ...existingList]);
      }
    }

    const updatedDefault = client.getQueryData<Order[]>(canonicalKey);
    expect(updatedDefault).toHaveLength(2);
    expect(updatedDefault?.[0].id).toBe("ord-uuid-002");
    expect(updatedDefault?.[1].id).toBe("ord-uuid-001");

    const deliveredList = client.getQueryData<Order[]>(deliveredKey);
    expect(deliveredList).toHaveLength(1);
    expect(deliveredList?.[0].id).toBe("ord-uuid-delivered");
  });

  it("prevents duplicate insertion when the order is already in the cached default list", () => {
    const client = makeClient();
    const canonicalKey = QUERY_KEYS.CUSTOMER.ORDERS.LIST({});

    client.setQueryData(canonicalKey, [newOrder, sampleOrder1]);

    const existingList = client.getQueryData<Order[]>(canonicalKey);
    if (Array.isArray(existingList)) {
      if (!existingList.some((o) => o.id === newOrder?.id)) {
        client.setQueryData<Order[]>(canonicalKey, [newOrder, ...existingList]);
      }
    }

    const result = client.getQueryData<Order[]>(canonicalKey);
    expect(result).toHaveLength(2);
    expect(result?.[0].id).toBe("ord-uuid-002");
    expect(result?.[1].id).toBe("ord-uuid-001");
  });
});
