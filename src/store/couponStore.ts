import { create } from "zustand";
import type { AppliedCoupon } from "@/src/types/cart";

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
  apply: (coupon) => set({ applied: coupon, justApplied: true }),
  remove: () => set({ applied: null, justApplied: false }),
  clearJustApplied: () => set({ justApplied: false }),
}));
