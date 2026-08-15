import { useCartPendingStore } from "@/src/store/cartStore";
import { AddToCartInput } from "@/src/features/cart/types";

/**
 * Real behavior tests for the guest cart Zustand store. Validates add / update /
 * remove / clear and pending-id tracking — the logic checkout and cart badges
 * depend on. AsyncStorage is mocked in jest.setup.ts.
 */

const makeInput = (over: Partial<AddToCartInput> = {}): AddToCartInput => ({
  medicineId: "med-1",
  variantId: null,
  medicineName: "Paracip 650",
  medicineSlug: "paracip-650",
  unitPrice: 15.4,
  mrp: 15.4,
  discountPercent: 0,
  quantity: 1,
  requiresPrescription: false,
  ...over,
});

const store = () => useCartPendingStore.getState();

beforeEach(() => {
  // Reset to a clean guest cart before each test (store is a singleton).
  store().clearGuestCart();
  useCartPendingStore.setState({ pendingIds: {} });
});

describe("cartStore — guest cart", () => {
  it("adds a new item to an empty cart", () => {
    const cart = store().addGuestItem(makeInput());
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].medicineName).toBe("Paracip 650");
    expect(cart.items[0].quantity).toBe(1);
  });

  it("increments quantity when the same item is added again (not duplicated)", () => {
    store().addGuestItem(makeInput({ quantity: 2 }));
    const cart = store().addGuestItem(makeInput({ quantity: 3 }));
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].quantity).toBe(5);
  });

  it("keeps different variants of the same medicine as separate lines", () => {
    store().addGuestItem(makeInput({ variantId: "v1" }));
    const cart = store().addGuestItem(makeInput({ variantId: "v2" }));
    expect(cart.items).toHaveLength(2);
  });

  it("updates an item's quantity", () => {
    const added = store().addGuestItem(makeInput());
    const cart = store().updateGuestItem(added.items[0].id, { quantity: 4 });
    expect(cart.items[0].quantity).toBe(4);
  });

  it("removes the item when updated quantity is zero or less", () => {
    const added = store().addGuestItem(makeInput());
    const cart = store().updateGuestItem(added.items[0].id, { quantity: 0 });
    expect(cart.items).toHaveLength(0);
  });

  it("removes a specific item", () => {
    const added = store().addGuestItem(makeInput());
    const cart = store().removeGuestItem(added.items[0].id);
    expect(cart.items).toHaveLength(0);
  });

  it("clears the whole guest cart", () => {
    store().addGuestItem(makeInput());
    store().addGuestItem(makeInput({ medicineId: "med-2", variantId: "v9" }));
    const cart = store().clearGuestCart();
    expect(cart.items).toHaveLength(0);
  });
});

describe("cartStore — pending ids", () => {
  it("tracks and clears pending flags per id", () => {
    store().setPending("med-1", true);
    expect(useCartPendingStore.getState().pendingIds["med-1"]).toBe(true);
    store().setPending("med-1", false);
    expect(useCartPendingStore.getState().pendingIds["med-1"]).toBe(false);
  });
});
