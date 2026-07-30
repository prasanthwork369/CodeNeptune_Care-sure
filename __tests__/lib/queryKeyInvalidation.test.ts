import { QueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/src/lib/react-query/queryKeys";

// Guards the real bug: invalidating with LIST() built a trailing `undefined` that never matched LIST({}),
// so placing an order left the order list stale.
describe("customer list query invalidation", () => {
  // Cached queries hold gc timers, so clear them or jest never exits.
  const clients: QueryClient[] = [];
  afterEach(() => {
    clients.forEach((c) => c.clear());
    clients.length = 0;
  });

  const makeClient = () => {
    const client = new QueryClient();
    clients.push(client);
    return client;
  };

  const seed = (client: QueryClient, key: readonly unknown[]) => {
    client.setQueryData(key, ["seeded"]);
    return client.getQueryCache().find({ queryKey: key });
  };

  it("ORDERS.LIST_ALL invalidates the default order list", () => {
    const client = makeClient();
    const query = seed(client, QUERY_KEYS.CUSTOMER.ORDERS.LIST({}));

    client.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOMER.ORDERS.LIST_ALL });

    expect(query?.state.isInvalidated).toBe(true);
  });

  it("ORDERS.LIST_ALL invalidates filtered order lists too", () => {
    const client = makeClient();
    const query = seed(
      client,
      QUERY_KEYS.CUSTOMER.ORDERS.LIST({ page: 2, status: "DELIVERED" }),
    );

    client.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOMER.ORDERS.LIST_ALL });

    expect(query?.state.isInvalidated).toBe(true);
  });

  it("RETURNS.LIST_ALL invalidates the default returns list", () => {
    const client = makeClient();
    const query = seed(client, QUERY_KEYS.CUSTOMER.RETURNS.LIST({}));

    client.invalidateQueries({
      queryKey: QUERY_KEYS.CUSTOMER.RETURNS.LIST_ALL,
    });

    expect(query?.state.isInvalidated).toBe(true);
  });

  it("documents why LIST() must not be used as an invalidation filter", () => {
    const client = makeClient();
    const query = seed(client, QUERY_KEYS.CUSTOMER.ORDERS.LIST({}));

    client.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOMER.ORDERS.LIST() });

    expect(query?.state.isInvalidated).toBe(false);
  });
});
