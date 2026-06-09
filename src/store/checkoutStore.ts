import { create } from 'zustand';

interface BillBreakdown {
    subtotal: number;
    productDiscount: number;
    couponDiscount: number;
    walletDiscount: number;
    coinsDiscount: number;
    deliveryFee: number;
    handlingCharge: number;
    totalSaved: number;
    toPay: number;
}

interface CheckoutState {
    bill: BillBreakdown | null;
    walletUsed: boolean;
    coinsUsed: boolean;
    couponCode: string;
    setBill: (bill: BillBreakdown, meta: { walletUsed: boolean; coinsUsed: boolean; couponCode: string }) => void;
    clear: () => void;
}

export const useCheckoutStore = create<CheckoutState>((set) => ({
    bill: null,
    walletUsed: false,
    coinsUsed: false,
    couponCode: '',
    setBill: (bill, meta) => set({ bill, walletUsed: meta.walletUsed, coinsUsed: meta.coinsUsed, couponCode: meta.couponCode }),
    clear: () => set({ bill: null, walletUsed: false, coinsUsed: false, couponCode: '' }),
}));
