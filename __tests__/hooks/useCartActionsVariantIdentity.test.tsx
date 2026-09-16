/**
 * Regression cover for the variant cart-identity fix.
 *
 * Mobile used to send the `medicine_variants.id` as `medicineId`. Catalog
 * (`/medicines/bulk`) and `medicine_stock` are both keyed to `medicines.id`,
 * so order-service could not resolve a price for those lines and rejected the
 * whole order at Place Order. The parent id now goes in `medicineId` and the
 * variant travels in `metadata.selectedVariantId` — the shape order-service's
 * add-item use case and cart repository actually read.
 */
import React from "react";
import { act, renderHook } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCartActions } from "@/src/features/cart/hooks/useCartActions";
import { QUERY_KEYS } from "@/src/lib/react-query/queryKeys";

const mockAddItem = jest.fn();
const mockUpdateItem = jest.fn();

jest.mock("@/src/utils/offline", () => ({ requireInternet: () => true }));

jest.mock("@/src/features/cart/services/cart.mutations", () => ({
  cartMutations: {
    addItem: (...a: unknown[]) => mockAddItem(...a),
    updateItem: (...a: unknown[]) => mockUpdateItem(...a),
    removeItem: jest.fn(),
  },
}));

jest.mock("@/src/store/authStore", () => ({
  useAuthStore: (sel: (s: { isAuthenticated: boolean }) => unknown) =>
    sel({ isAuthenticated: true }),
}));

jest.mock("@/src/store/cartStore", () => ({
  useCartPendingStore: Object.assign(
    (sel: (s: Record<string, unknown>) => unknown) =>
      sel({ pendingIds: {}, setPending: jest.fn(), guestCart: { items: [] } }),
    {
      getState: () => ({
        pendingIds: {},
        setPending: jest.fn(),
        guestCart: { items: [] },
      }),
    },
  ),
}));

jest.mock("@/src/features/cart/utils/cartError", () => ({
  notifyCartError: jest.fn(),
}));
jest.mock("@/src/services/firebase", () => ({
  analyticsService: { logAddToCart: jest.fn() },
}));

const PARENT_ID = "11111111-1111-4111-8111-111111111111";
const VARIANT_A = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const VARIANT_B = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

const variantProduct = (variantId: string | null) => ({
  medicineId: PARENT_ID,
  variantId,
  productId: "CS-ABC123",
  name: "Zincovit",
  slug: "zincovit",
  price: 100,
  originalPrice: 120,
  discountPercent: 10,
  packSize: "60",
  unit: "ml",
});

const cartRow = (over: Record<string, unknown>) => ({
  id: "row",
  cartId: "cart-1",
  medicineName: "Zincovit",
  medicineSlug: "zincovit",
  unitPrice: 120,
  quantity: 1,
  requiresPrescription: false,
  createdAt: "",
  updatedAt: "",
  ...over,
});

/** Seeds the cart query cache the hook reads through. */
const wrapperWithCart = (items: unknown[]) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  queryClient.setQueryData(QUERY_KEYS.CUSTOMER.CART, { items });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return Wrapper;
};

describe("cart variant identity", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAddItem.mockResolvedValue(undefined);
    mockUpdateItem.mockResolvedValue(undefined);
  });

  it("sends the parent medicineId, never the variant UUID", async () => {
    const { result } = renderHook(
      () => useCartActions(variantProduct(VARIANT_A) as never),
      { wrapper: wrapperWithCart([]) },
    );

    await act(async () => {
      await result.current.increment();
    });

    expect(mockAddItem).toHaveBeenCalledTimes(1);
    const payload = mockAddItem.mock.calls[0][0];
    expect(payload.medicineId).toBe(PARENT_ID);
    expect(payload.medicineId).not.toBe(VARIANT_A);
  });

  it("carries the selected variant in metadata.selectedVariantId", async () => {
    const { result } = renderHook(
      () => useCartActions(variantProduct(VARIANT_A) as never),
      { wrapper: wrapperWithCart([]) },
    );

    await act(async () => {
      await result.current.increment();
    });

    const payload = mockAddItem.mock.calls[0][0];
    expect(payload.metadata.selectedVariantId).toBe(VARIANT_A);
    expect(payload.variantId).toBe(VARIANT_A);
  });

  it("omits selectedVariantId for a product with no variant", async () => {
    const { result } = renderHook(
      () => useCartActions(variantProduct(null) as never),
      { wrapper: wrapperWithCart([]) },
    );

    await act(async () => {
      await result.current.increment();
    });

    const payload = mockAddItem.mock.calls[0][0];
    expect(payload.medicineId).toBe(PARENT_ID);
    expect(payload.metadata.selectedVariantId).toBeUndefined();
  });

  // The trap introduced by moving to the parent id: every variant of one
  // medicine now shares a medicineId, so matching on it alone would make each
  // variant's card read (and edit) whichever variant row happened to be first.
  it("keeps two variants of one medicine on separate rows", () => {
    const items = [
      cartRow({
        id: "row-a",
        medicineId: PARENT_ID,
        quantity: 2,
        metadata: { selectedVariantId: VARIANT_A },
      }),
      cartRow({
        id: "row-b",
        medicineId: PARENT_ID,
        quantity: 5,
        metadata: { selectedVariantId: VARIANT_B },
      }),
    ];
    const wrapper = wrapperWithCart(items);

    const a = renderHook(
      () => useCartActions(variantProduct(VARIANT_A) as never),
      { wrapper },
    );
    const b = renderHook(
      () => useCartActions(variantProduct(VARIANT_B) as never),
      { wrapper },
    );

    expect(a.result.current.count).toBe(2);
    expect(b.result.current.count).toBe(5);
  });

  it("does not match a variant card against a variant-less row", () => {
    const wrapper = wrapperWithCart([
      cartRow({ id: "row-plain", medicineId: PARENT_ID, quantity: 3 }),
    ]);

    const { result } = renderHook(
      () => useCartActions(variantProduct(VARIANT_A) as never),
      { wrapper },
    );

    expect(result.current.count).toBe(0);
  });

  it("still matches a variant-less card against a variant-less row", () => {
    const wrapper = wrapperWithCart([
      cartRow({ id: "row-plain", medicineId: PARENT_ID, quantity: 3 }),
    ]);

    const { result } = renderHook(
      () => useCartActions(variantProduct(null) as never),
      { wrapper },
    );

    expect(result.current.count).toBe(3);
  });

  // Carts created by the shipped build still hold rows whose medicineId is the
  // variant UUID; those must stay readable/editable after the upgrade.
  it("still matches legacy rows that stored the variant UUID in medicineId", () => {
    const wrapper = wrapperWithCart([
      cartRow({ id: "row-legacy", medicineId: VARIANT_A, quantity: 4 }),
    ]);

    const { result } = renderHook(
      () => useCartActions(variantProduct(VARIANT_A) as never),
      { wrapper },
    );

    expect(result.current.count).toBe(4);
  });
});
