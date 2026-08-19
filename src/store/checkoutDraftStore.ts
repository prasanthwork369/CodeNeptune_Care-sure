import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { HealthProblem } from "@/src/features/prescription/types";

interface CheckoutDraftState {
  patientMemberId: string;
  patientPhone: string;
  paymentMethod: string;
  couponCode: string;
  symptoms: string;
  healthProblem: HealthProblem | null;
  setPatient: (memberId: string, phone: string) => void;
  setPaymentMethod: (method: string) => void;
  setCouponCode: (code: string) => void;
  setSymptoms: (symptoms: string) => void;
  setHealthProblem: (problem: HealthProblem | null) => void;
  clearDraft: () => void;
}

// Persists mid-checkout draft fields (patient, symptoms, payments) across restarts
export const useCheckoutDraftStore = create<CheckoutDraftState>()(
  persist(
    (set) => ({
      patientMemberId: "",
      patientPhone: "",
      paymentMethod: "COD",
      couponCode: "",
      symptoms: "",
      healthProblem: null,
      setPatient: (memberId, phone) =>
        set({ patientMemberId: memberId, patientPhone: phone }),
      setPaymentMethod: (method) => set({ paymentMethod: method }),
      setCouponCode: (code) => set({ couponCode: code }),
      setSymptoms: (symptoms) => set({ symptoms }),
      setHealthProblem: (problem) => set({ healthProblem: problem }),
      clearDraft: () =>
        set({
          patientMemberId: "",
          patientPhone: "",
          paymentMethod: "COD",
          couponCode: "",
          symptoms: "",
          healthProblem: null,
        }),
    }),
    {
      name: "caresure-checkout-draft",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
