import AsyncStorage from "@react-native-async-storage/async-storage";
import { AddToCartInput, Cart, CartItem, UpdateCartItemInput } from "@/src/types/cart";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const createGuestCart = (items: CartItem[] = []): Cart => ({
  id: "guest-cart",
  customerId: "guest",
  status: "active",
  expiresAt: "",
  createdAt: "",
  updatedAt: "",
  items,
});

const getGuestItemId = (input: AddToCartInput) => {
  const variantId = input.metadata?.selectedVariantId ?? input.variantId;
  return variantId ? `${input.medicineId}-${variantId}` : String(input.medicineId);
};

const toGuestCartItem = (input: AddToCartInput): CartItem => {
  const now = new Date().toISOString();
  const id = getGuestItemId(input);

  return {
    id,
    cartId: "guest-cart",
    medicineId: String(input.medicineId),
    productId: input.metadata?.productId,
    medicineName: input.medicineName,
    medicineSlug: input.medicineSlug,
    unitPrice: input.unitPrice,
    quantity: input.quantity,
    requiresPrescription: input.requiresPrescription,
    prescriptionId: input.prescriptionId,
    metadata: {
      ...input.metadata,
      ...(input.variantId ? { selectedVariantId: input.variantId } : {}),
      image: input.image ?? input.metadata?.image,
      discountPercent: input.discountPercent,
    },
    createdAt: now,
    updatedAt: now,
    originalPrice: input.mrp,
    discountPercent: input.discountPercent,
    image: input.image ?? input.metadata?.image,
    name: input.medicineName,
  };
};

interface CartState {
  // Cart data (synced via socket and mutations)
  cart: Cart | null;
  setCart: (cart: Cart) => void;

  // Guest cart data (persisted locally for users who have not logged in)
  guestCart: Cart;
  addGuestItem: (input: AddToCartInput) => Cart;
  updateGuestItem: (itemId: string, input: UpdateCartItemInput) => Cart;
  removeGuestItem: (itemId: string) => Cart;
  clearGuestCart: () => Cart;

  // Pending operation tracking
  pendingIds: Record<string, boolean>;
  setPending: (id: string, pending: boolean) => void;
}

export const useCartPendingStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: null,
      setCart: (cart) => set({ cart }),

      guestCart: createGuestCart(),
      addGuestItem: (input) => {
        const itemId = getGuestItemId(input);
        const current = get().guestCart ?? createGuestCart();
        const existing = current.items.find((item) => item.id === itemId);
        const items = existing
          ? current.items.map((item) =>
              item.id === itemId
                ? {
                    ...item,
                    quantity: item.quantity + input.quantity,
                    updatedAt: new Date().toISOString(),
                  }
                : item,
            )
          : [...current.items, toGuestCartItem(input)];

        const guestCart = { ...current, items, updatedAt: new Date().toISOString() };
        set({ guestCart });
        return guestCart;
      },
      updateGuestItem: (itemId, input) => {
        const current = get().guestCart ?? createGuestCart();
        const items =
          input.quantity <= 0
            ? current.items.filter((item) => item.id !== itemId)
            : current.items.map((item) =>
                item.id === itemId
                  ? { ...item, quantity: input.quantity, updatedAt: new Date().toISOString() }
                  : item,
              );
        const guestCart = { ...current, items, updatedAt: new Date().toISOString() };
        set({ guestCart });
        return guestCart;
      },
      removeGuestItem: (itemId) => {
        const current = get().guestCart ?? createGuestCart();
        const guestCart = {
          ...current,
          items: current.items.filter((item) => item.id !== itemId),
          updatedAt: new Date().toISOString(),
        };
        set({ guestCart });
        return guestCart;
      },
      clearGuestCart: () => {
        const guestCart = createGuestCart();
        set({ guestCart });
        return guestCart;
      },

      pendingIds: {},
      setPending: (id, pending) =>
        set((s) => ({
          pendingIds: { ...s.pendingIds, [id]: pending },
        })),
    }),
    {
      name: "caresure.guest.cart",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ guestCart: state.guestCart }),
    },
  ),
);
