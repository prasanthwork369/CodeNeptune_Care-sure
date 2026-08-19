import { create } from "zustand";
import { REFUND_METHOD, RefundMethodValue } from "@/src/features/orders/constants/return";
import type { ConfirmedReturnItem } from "@/src/features/orders/types";

interface ReturnDraftState {
  orderId: string | null;
  items: ConfirmedReturnItem[];
  refundMethod: RefundMethodValue;
  setOrderId: (orderId: string) => void;
  addConfirmedItem: (item: ConfirmedReturnItem) => void;
  removeConfirmedItem: (orderItemId: string) => void;
  setRefundMethod: (method: RefundMethodValue) => void;
  clearReturnDraft: () => void;
}

// In-memory draft of confirmed return items that resets when switching orders
export const useReturnDraftStore = create<ReturnDraftState>((set, get) => ({
  orderId: null,
  items: [],
  refundMethod: REFUND_METHOD.WALLET,

  setOrderId: (orderId) => {
    if (get().orderId !== orderId) {
      set({ orderId, items: [] });
    }
  },

  addConfirmedItem: (item) => {
    set((state) => {
      const existingIndex = state.items.findIndex(
        (i) => i.orderItemId === item.orderItemId,
      );
      if (existingIndex !== -1) {
        const items = [...state.items];
        items[existingIndex] = item;
        return { items };
      }
      return { items: [...state.items, item] };
    });
  },

  removeConfirmedItem: (orderItemId) => {
    set((state) => ({
      items: state.items.filter((i) => i.orderItemId !== orderItemId),
    }));
  },

  setRefundMethod: (method) => set({ refundMethod: method }),

  clearReturnDraft: () =>
    set({ orderId: null, items: [], refundMethod: REFUND_METHOD.WALLET }),
}));
