// Combine multiple API calls into one batched request to reduce network overhead

import { apiClient } from "./client";

interface BatchRequest {
  queries: string[];
}

interface BatchResponse {
  data: Record<string, unknown>;
  errors?: Record<string, { message: string; code: string }>;
}

/**
 * Batch multiple API calls into one request.
 *
 * Supported queries: profile, cart, orders, addresses, wallet, coupons
 *
 * @param queries - Array of query names to fetch
 * @returns Object with keyed results for each query
 *
 * @example
 * const { profile, cart, orders } = await batchFetch(['profile', 'cart', 'orders']);
 */
export async function batchFetch(
  queries: string[],
): Promise<BatchResponse["data"]> {
  if (queries.length === 0) {
    return {};
  }

  // Single query: use direct API instead of batch overhead
  if (queries.length === 1) {
    return fetchSingleQuery(queries[0]).then(result => ({
      [queries[0]]: result,
    }));
  }

  try {
    const { data } = await apiClient.post<BatchResponse>(
      "/api/v1/batch",
      { queries } as BatchRequest,
    );

    if (data.errors && __DEV__) {
      console.warn("Batch request had errors:", data.errors);
    }

    return (data.data as Record<string, unknown>) || {};
  } catch (error) {
    if (__DEV__) console.error("Batch request failed:", error);
    // Fallback: fetch individual queries
    return Promise.all(
      queries.map((q) =>
        fetchSingleQuery(q)
          .then((result) => ({ [q]: result }))
          .catch(() => ({ [q]: null })),
      ),
    ).then((results) =>
      results.reduce((acc, cur) => ({ ...acc, ...cur }), {}),
    );
  }
}

/**
 * Fetch a single query from the batch API.
 * Used as fallback when batch endpoint is unavailable.
 */
async function fetchSingleQuery(
  query: string,
): Promise<unknown> {
  const endpoints: Record<string, string> = {
    profile: "/api/v1/customers/profile",
    cart: "/api/v1/cart",
    orders: "/api/v1/orders",
    addresses: "/api/v1/customers/addresses",
    wallet: "/api/v1/customers/wallet",
    coupons: "/api/v1/coupons",
    prescriptions: "/api/v1/prescriptions",
  };

  const endpoint = endpoints[query];
  if (!endpoint) {
    throw new Error(`Unknown query: ${query}`);
  }

  const { data } = await apiClient.get(endpoint);
  return data.data || data;
}

/**
 * Hook to batch load multiple data on app startup.
 * Used in root layout to prefetch critical data.
 */
export async function prefetchAppData() {
  try {
    const data = await batchFetch([
      "profile",
      "cart",
      "coupons",
      "addresses",
    ]);

    return {
      profile: data.profile,
      cart: data.cart,
      coupons: data.coupons,
      addresses: data.addresses,
    };
  } catch (error) {
    console.error("Failed to prefetch app data:", error);
    return null;
  }
}

/**
 * Common batch queries for different screens.
 */

export async function fetchHomeScreenData() {
  return batchFetch([
    "profile",
    "cart",
    "coupons",
    "prescriptions",
  ]);
}

export async function fetchCheckoutData() {
  return batchFetch([
    "cart",
    "addresses",
    "wallet",
    "coupons",
  ]);
}

export async function fetchProfileScreenData() {
  return batchFetch([
    "profile",
    "addresses",
    "wallet",
    "orders",
  ]);
}
