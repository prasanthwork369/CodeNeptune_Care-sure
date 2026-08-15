import { act, renderHook } from "@testing-library/react-native";
import { useCartActions } from "@/src/features/cart/hooks/useCartActions";

const mockRequireInternet = jest.fn(() => true);
const mockAddItem = jest.fn();
const mockUpdateItem = jest.fn();
let mockIsAuthenticated = true;

jest.mock("@/src/utils/offline", () => ({
  requireInternet: () => mockRequireInternet(),
}));

jest.mock("@/src/services/cart.mutations", () => ({
  cartMutations: {
    addItem: (...a: unknown[]) => mockAddItem(...a),
    updateItem: (...a: unknown[]) => mockUpdateItem(...a),
    removeItem: jest.fn(),
  },
}));

jest.mock("@/src/store/authStore", () => ({
  useAuthStore: (sel: (s: { isAuthenticated: boolean }) => unknown) =>
    sel({ isAuthenticated: mockIsAuthenticated }),
}));

jest.mock("@/src/hooks/queries/useCartRead", () => ({
  useCartRead: () => ({ items: [] }),
}));

jest.mock("@/src/store/cartStore", () => ({
  useCartPendingStore: Object.assign(
    (sel: (s: Record<string, unknown>) => unknown) =>
      sel({ pendingIds: {}, setPending: jest.fn() }),
    { getState: () => ({ pendingIds: {}, setPending: jest.fn() }) },
  ),
}));

jest.mock("@/src/utils/cartError", () => ({ notifyCartError: jest.fn() }));
jest.mock("@/src/services/firebase", () => ({
  analyticsService: { logAddToCart: jest.fn() },
}));

const product = {
  medicineId: "med-1",
  name: "Paracip 650",
  slug: "paracip-650",
  price: 15.4,
  originalPrice: 15.4,
  discountPercent: 0,
};

describe("useCartActions.increment result contract", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireInternet.mockReturnValue(true);
    mockIsAuthenticated = true;
    mockAddItem.mockResolvedValue(undefined);
  });

  it("resolves true when the item reaches the cart", async () => {
    const { result } = renderHook(() => useCartActions(product as never));

    let added: boolean | undefined;
    await act(async () => {
      added = await result.current.increment();
    });

    expect(added).toBe(true);
    expect(mockAddItem).toHaveBeenCalledTimes(1);
  });

  // The reported bug: offline the add is refused, but the caller had no way to
  // know, so the fly-to-cart animation ran and the badge counted up anyway.
  it("resolves false offline and never calls the API", async () => {
    mockRequireInternet.mockReturnValue(false);
    const { result } = renderHook(() => useCartActions(product as never));

    let added: boolean | undefined;
    await act(async () => {
      added = await result.current.increment();
    });

    expect(added).toBe(false);
    expect(mockAddItem).not.toHaveBeenCalled();
  });

  // Guest carts are local by design, so an offline add genuinely succeeds and
  // the animation is correct.
  it("still succeeds offline for a guest", async () => {
    mockIsAuthenticated = false;
    mockRequireInternet.mockReturnValue(false);
    const { result } = renderHook(() => useCartActions(product as never));

    let added: boolean | undefined;
    await act(async () => {
      added = await result.current.increment();
    });

    expect(added).toBe(true);
    expect(mockAddItem).toHaveBeenCalledTimes(1);
  });

  it("resolves false when the write fails", async () => {
    mockAddItem.mockRejectedValue(new Error("500"));
    const { result } = renderHook(() => useCartActions(product as never));

    let added: boolean | undefined;
    await act(async () => {
      added = await result.current.increment();
    });

    expect(added).toBe(false);
  });

  it("resolves false for an unusable product", async () => {
    const { result } = renderHook(() =>
      useCartActions({ ...product, medicineId: "", price: 0 } as never),
    );

    let added: boolean | undefined;
    await act(async () => {
      added = await result.current.increment();
    });

    expect(added).toBe(false);
    expect(mockAddItem).not.toHaveBeenCalled();
  });
});
