import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Verified-banner completion record — one per prescription.
 * Once `verifiedBannerCompleted` is true it stays true forever (the banner
 * must never reappear for that prescription, regardless of cart activity
 * elsewhere in the app).
 */
export interface VerifiedBannerRecord {
    prescriptionId: string;
    verifiedBannerCompleted: boolean;
}

interface PrescriptionBannerState {
    /** Verified-banner completion, keyed by prescriptionId. */
    verifiedRecords: Record<string, VerifiedBannerRecord>;
    /**
     * Rejected-banner "seen" flags, keyed by `${prescriptionId}:${status}` so a
     * fresh rejection event (re-submission rejected again) gets its own,
     * unseen banner instead of inheriting a stale "seen" flag.
     */
    rejectedSeen: Record<string, boolean>;

    /** Marks the verified banner complete — call ONLY on first successful add-to-cart from MedicineComparisonLayout. */
    markVerifiedBannerCompleted: (prescriptionId: string) => void;
    isVerifiedBannerCompleted: (prescriptionId: string) => boolean;

    markRejectedBannerSeen: (prescriptionId: string, status: number) => void;
    isRejectedBannerSeen: (prescriptionId: string, status: number) => boolean;

    clearAll: () => void;
}

const rejectedKey = (prescriptionId: string, status: number) => `${prescriptionId}:${status}`;

export const usePrescriptionBannerStore = create<PrescriptionBannerState>()(
    persist(
        (set, get) => ({
            verifiedRecords: {},
            rejectedSeen: {},

            markVerifiedBannerCompleted: (prescriptionId) => {
                set((s) => ({
                    verifiedRecords: {
                        ...s.verifiedRecords,
                        [prescriptionId]: { prescriptionId, verifiedBannerCompleted: true },
                    },
                }));
            },

            isVerifiedBannerCompleted: (prescriptionId) =>
                !!get().verifiedRecords[prescriptionId]?.verifiedBannerCompleted,

            markRejectedBannerSeen: (prescriptionId, status) => {
                const key = rejectedKey(prescriptionId, status);
                set((s) => ({ rejectedSeen: { ...s.rejectedSeen, [key]: true } }));
            },

            isRejectedBannerSeen: (prescriptionId, status) =>
                !!get().rejectedSeen[rejectedKey(prescriptionId, status)],

            clearAll: () => set({ verifiedRecords: {}, rejectedSeen: {} }),
        }),
        {
            name: 'caresure-prescription-banners',
            storage: createJSONStorage(() => AsyncStorage),
        },
    ),
);
