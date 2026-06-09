import { create } from 'zustand';
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
    setLocation: (location: DeliveryLocation, options?: SetLocationOptions) => void;
    clearLocation: () => void;
    setReopenLocationSheet: (value: boolean) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
    location: null,
    coords: null,
    selectedAddressId: null,
    pincode: null,
    reopenLocationSheet: false,
    setLocation: (location, options) =>
        set({
            location,
            coords: options?.coords ?? null,
            selectedAddressId: options?.addressId ?? null,
            pincode: options?.pincode ?? null,
        }),
    clearLocation: () => set({ location: null, coords: null, selectedAddressId: null, pincode: null }),
    setReopenLocationSheet: (value) => set({ reopenLocationSheet: value }),
}));
