import { create } from "zustand";
import type { AppliedCoupon } from "@/src/types/cart";
import { useCheckoutDraftStore } from "@/src/store/checkoutDraftStore";

interface CouponState {
  applied: AppliedCoupon | null;
  justApplied: boolean;
  apply: (coupon: AppliedCoupon) => void;
  remove: () => void;
  clearJustApplied: () => void;
}

export const useCouponStore = create<CouponState>((set) => ({
  applied: null,
  justApplied: false,
  apply: (coupon) => {
    set({ applied: coupon, justApplied: true });
    useCheckoutDraftStore.getState().setCouponCode(coupon.code);
  },
  remove: () => {
    set({ applied: null, justApplied: false });
    useCheckoutDraftStore.getState().setCouponCode("");
  },
  clearJustApplied: () => set({ justApplied: false }),
}));
