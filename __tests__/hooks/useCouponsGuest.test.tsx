/**
 * Guests could not see coupons on mobile, while the website shows them —
 * GET /coupons/active is mounted above authenticateUser and resolves the
 * customer optionally, so there was never a backend reason to gate it.
 */
import React from "react";
import { renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCoupons } from "@/src/features/cart/hooks/useCoupons";
import { couponApi } from "@/src/features/cart/api/coupon.api";
import { QUERY_KEYS } from "@/src/lib/react-query/queryKeys";

jest.mock("@/src/features/cart/api/coupon.api", () => ({
  couponApi: { getActiveCoupons: jest.fn() },
}));

let mockIsAuthenticated = false;
jest.mock("@/src/store/authStore", () => ({
  useAuthStore: (sel: (s: { isAuthenticated: boolean }) => unknown) =>
    sel({ isAuthenticated: mockIsAuthenticated }),
}));

const getActiveCoupons = couponApi.getActiveCoupons as jest.Mock;

const makeClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } });

const wrapperFor = (client: QueryClient) =>
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
  };

describe("useCoupons", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getActiveCoupons.mockResolvedValue([{ code: "SAVE10" }]);
  });

  it("fetches coupons for a guest", async () => {
    mockIsAuthenticated = false;
    const { result } = renderHook(() => useCoupons(), {
      wrapper: wrapperFor(makeClient()),
    });

    await waitFor(() => expect(result.current.data).toHaveLength(1));
    expect(getActiveCoupons).toHaveBeenCalled();
  });

  it("fetches coupons for a signed-in customer", async () => {
    mockIsAuthenticated = true;
    const { result } = renderHook(() => useCoupons(), {
      wrapper: wrapperFor(makeClient()),
    });

    await waitFor(() => expect(result.current.data).toHaveLength(1));
  });

  // isUsedUp is annotated per customer, so reusing a guest list after login
  // would show already-used coupons as available.
  it("does not reuse the guest list once signed in", async () => {
    const client = makeClient();

    mockIsAuthenticated = false;
    const guest = renderHook(() => useCoupons(), { wrapper: wrapperFor(client) });
    await waitFor(() => expect(guest.result.current.data).toBeDefined());

    getActiveCoupons.mockResolvedValue([{ code: "SAVE10", isUsedUp: true }]);
    mockIsAuthenticated = true;
    const member = renderHook(() => useCoupons(), {
      wrapper: wrapperFor(client),
    });
    await waitFor(() =>
      expect(member.result.current.data?.[0]).toMatchObject({ isUsedUp: true }),
    );

    expect(getActiveCoupons).toHaveBeenCalledTimes(2);
  });

  // The cart socket invalidates with the base key; it must still match.
  it("keys under the shared coupons prefix so socket invalidation reaches it", async () => {
    mockIsAuthenticated = true;
    const client = makeClient();
    const { result } = renderHook(() => useCoupons(), {
      wrapper: wrapperFor(client),
    });
    await waitFor(() => expect(result.current.data).toBeDefined());

    const matched = client.getQueryCache().findAll({
      queryKey: QUERY_KEYS.CUSTOMER.COUPONS,
    });
    expect(matched).toHaveLength(1);
  });
});
