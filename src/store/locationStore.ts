import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { DeliveryLocation } from '@/src/types/home';

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
    /** False until the persisted pick has been read back from AsyncStorage. */
    hasHydrated: boolean;
    setLocation: (location: DeliveryLocation, options?: SetLocationOptions) => void;
    clearLocation: () => void;
    setReopenLocationSheet: (value: boolean) => void;
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
            hasHydrated: false,
            setLocation: (location, options) =>
                set({
                    location,
                    coords: options?.coords ?? null,
                    selectedAddressId: options?.addressId ?? null,
                    pincode: options?.pincode ?? null,
                }),
            clearLocation: () => set({ location: null, coords: null, selectedAddressId: null, pincode: null }),
            setReopenLocationSheet: (value) => set({ reopenLocationSheet: value }),
            setHasHydrated: (value) => set({ hasHydrated: value }),
        }),
        {
            name: 'caresure-location',
            storage: createJSONStorage(() => AsyncStorage),
            // The user's address pick must survive a restart. `reopenLocationSheet`
            // is per-session UI state, and coords are re-fetched, so neither is kept.
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

/**
 * Resolves once the persisted address pick has been read back from storage.
 *
 * Anything that writes a location during startup must await this first. The
 * persist middleware saves on every `set`, so a write that lands before the
 * initial read can overwrite the stored pick with a fresh value and lose the
 * user's choice for good.
 */
export const waitForLocationHydration = (): Promise<void> => {
    if (useLocationStore.persist.hasHydrated()) return Promise.resolve();
    return new Promise((resolve) => {
        const unsubscribe = useLocationStore.persist.onFinishHydration(() => {
            unsubscribe();
            resolve();
        });
    });
};
