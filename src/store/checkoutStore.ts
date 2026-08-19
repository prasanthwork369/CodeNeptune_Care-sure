import { create } from "zustand";
import type { CartSnapshotLine } from "@/src/utils/cartSnapshot";

export interface BillBreakdown {
  subtotal: number;
  productDiscount: number;
  couponDiscount: number;
  walletDiscount: number;
  coinsDiscount: number;
  corporateCreditsDiscount: number;
  deliveryFee: number;
  handlingCharge: number;
  totalSaved: number;
  toPay: number;
}

interface CheckoutState {
  bill: BillBreakdown | null;
  // Frozen cart snapshot to prevent checkout billing price drift
  cartSnapshot: CartSnapshotLine[];
  walletUsed: boolean;
  coinsUsed: boolean;
  corporateCreditsUsed: boolean;
  couponCode: string;
  setBill: (
    bill: BillBreakdown,
    meta: {
      walletUsed: boolean;
      coinsUsed: boolean;
      corporateCreditsUsed: boolean;
      couponCode: string;
    },
    cartSnapshot: CartSnapshotLine[],
  ) => void;
  clear: () => void;
}

export const useCheckoutStore = create<CheckoutState>((set) => ({
  bill: null,
  cartSnapshot: [],
  walletUsed: false,
  coinsUsed: false,
  corporateCreditsUsed: false,
  couponCode: "",
  setBill: (bill, meta, cartSnapshot) =>
    set({
      bill,
      cartSnapshot,
      walletUsed: meta.walletUsed,
      coinsUsed: meta.coinsUsed,
      corporateCreditsUsed: meta.corporateCreditsUsed,
      couponCode: meta.couponCode,
    }),
  clear: () =>
    set({
      bill: null,
      cartSnapshot: [],
      walletUsed: false,
      coinsUsed: false,
      corporateCreditsUsed: false,
      couponCode: "",
    }),
}));
