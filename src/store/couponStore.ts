import { create } from "zustand";

interface AppliedCoupon {
  code: string;
  discount: number;
  description: string;
}

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
