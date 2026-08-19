import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { DeliveryLocation } from "@/src/features/home/types";

interface SetLocationOptions {
  coords?: { latitude: number; longitude: number };
  addressId?: string;
  pincode?: string;
}

interface LocationState {
  location: DeliveryLocation | null;
  coords: { latitude: number; longitude: number } | null;
  selectedAddressId: string | null;
  pincode: string | null;
  reopenLocationSheet: boolean;
  /** Temporary UI flag to trigger the Home header's delivery hint toast */
  justConfirmedLocation: boolean;
  /** Store hydration complete status */
  hasHydrated: boolean;
  setLocation: (
    location: DeliveryLocation,
    options?: SetLocationOptions,
  ) => void;
  clearLocation: () => void;
  setReopenLocationSheet: (value: boolean) => void;
  setJustConfirmedLocation: (value: boolean) => void;
  setHasHydrated: (value: boolean) => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      location: null,
      coords: null,
      selectedAddressId: null,
      pincode: null,
      reopenLocationSheet: false,
      justConfirmedLocation: false,
      hasHydrated: false,
      setLocation: (location, options) =>
        set({
          location,
          coords: options?.coords ?? null,
          selectedAddressId: options?.addressId ?? null,
          pincode: options?.pincode ?? null,
        }),
      clearLocation: () =>
        set({
          location: null,
          coords: null,
          selectedAddressId: null,
          pincode: null,
        }),
      setReopenLocationSheet: (value) => set({ reopenLocationSheet: value }),
      setJustConfirmedLocation: (value) =>
        set({ justConfirmedLocation: value }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "caresure-location",
      storage: createJSONStorage(() => AsyncStorage),
      // Persist chosen location details; skip transient state keys
      partialize: (state) => ({
        location: state.location,
        selectedAddressId: state.selectedAddressId,
        pincode: state.pincode,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

/** Resolves when location store hydration completes to prevent early startup writes overwriting persisted choices. */
export const waitForLocationHydration = (): Promise<void> => {
  if (useLocationStore.persist.hasHydrated()) return Promise.resolve();
  return new Promise((resolve) => {
    const unsubscribe = useLocationStore.persist.onFinishHydration(() => {
      unsubscribe();
      resolve();
    });
  });
};
