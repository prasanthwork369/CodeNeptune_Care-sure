import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface CheckoutDraftState {
  patientMemberId: string;
  patientPhone: string;
  paymentMethod: string;
  couponCode: string;
  setPatient: (memberId: string, phone: string) => void;
  setPaymentMethod: (method: string) => void;
  setCouponCode: (code: string) => void;
  clearDraft: () => void;
}

// Survives an app kill mid-checkout so patient, coupon and payment method can
// be pre-filled the next time the user reaches the relevant screen. The
// selected address already persists separately via locationStore.
export const useCheckoutDraftStore = create<CheckoutDraftState>()(
  persist(
    (set) => ({
      patientMemberId: "",
      patientPhone: "",
      paymentMethod: "COD",
      couponCode: "",
      setPatient: (memberId, phone) =>
        set({ patientMemberId: memberId, patientPhone: phone }),
      setPaymentMethod: (method) => set({ paymentMethod: method }),
      setCouponCode: (code) => set({ couponCode: code }),
      clearDraft: () =>
        set({
          patientMemberId: "",
          patientPhone: "",
          paymentMethod: "COD",
          couponCode: "",
        }),
    }),
    {
      name: "caresure-checkout-draft",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
