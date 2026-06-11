import { create } from "zustand";

interface Cart {
  id?: string;
  items: any[];
  totalPrice?: number;
  totalItems?: number;
}

interface CartState {
  // Cart data (synced via socket and mutations)
  cart: Cart | null;
  setCart: (cart: Cart) => void;

  // Pending operation tracking
  pendingIds: Record<string, boolean>;
  setPending: (id: string, pending: boolean) => void;
}

export const useCartPendingStore = create<CartState>((set) => ({
  cart: null,
  setCart: (cart) => set({ cart }),

  pendingIds: {},
  setPending: (id, pending) =>
    set((s) => ({
      pendingIds: { ...s.pendingIds, [id]: pending },
    })),
}));
