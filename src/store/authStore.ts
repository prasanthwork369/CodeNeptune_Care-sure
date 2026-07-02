import { create } from 'zustand';
import { tokenStorage, guestStorage } from '@/src/lib/storage';
import { profileApi, CustomerProfile } from '../api/profile.api';
import { setAccessToken } from '../api/client';
import { queryClient } from '@/src/lib/react-query/queryClient';
import { apiCache } from '@/src/lib/sqlite/cache';
import { usePrescriptionDraftStore } from './prescriptionDraftStore';
import { useCouponStore } from './couponStore';
import { useNotificationStore } from './notificationStore';
import { useLocationStore } from './locationStore';

interface AuthState {
    isAuthenticated: boolean;
    isGuest: boolean; // User skipped login — browse as guest, prompt to login at checkout
    isLoaded: boolean; // Initial hydration check
    token: string | null;
    user: CustomerProfile | null;
    initialize: () => Promise<void>;
    login: (token: string, expiresIn: number) => Promise<void>;
    continueAsGuest: () => Promise<void>;
    setUser: (user: CustomerProfile | null) => void;
    logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    isAuthenticated: false,
    isGuest: false,
    isLoaded: false,
    token: null,
    user: null,

    initialize: async () => {
        try {
            const token = await tokenStorage.get();
            if (token) {
                setAccessToken(token);
                set({ token, isAuthenticated: true });
                try {
                    const profile = await profileApi.getProfile();
                    set({ user: profile, isLoaded: true });
                } catch {
                    // Token is invalid/expired — clear it so socket doesn't attempt connection
                    await get().logout();
                    set({ isLoaded: true });
                }
            } else {
                const isGuest = await guestStorage.get();
                set({ isGuest, isLoaded: true });
            }
        } catch (error) {
            if (__DEV__) console.error('Auth initialization failed:', error);
            set({ isLoaded: true });
        }
    },

    login: async (token: string, expiresIn: number) => {
        const expiresAt = Date.now() + expiresIn * 1000;
        setAccessToken(token); // set in-memory immediately
        set({ isAuthenticated: true, isGuest: false, token });
        await tokenStorage.set(token);
        await tokenStorage.setExpiresAt(expiresAt);
        await guestStorage.clear();
    },

    continueAsGuest: async () => {
        set({ isGuest: true });
        await guestStorage.set(true);
    },

    setUser: (user) => set({ user }),

    logout: async () => {
        setAccessToken(null);
        set({ isAuthenticated: false, isGuest: false, token: null, user: null });

        // Clear all user-specific state
        usePrescriptionDraftStore.getState().clearItems();
        useCouponStore.getState().remove();
        useNotificationStore.getState().clear();
        useLocationStore.getState().clearLocation();
        queryClient.clear();
        apiCache.remove('customer_profile');

        await tokenStorage.clear();
        await tokenStorage.clearExpiresAt();
        await tokenStorage.clearRefreshToken();
        await tokenStorage.clearAvatarUri();
        await guestStorage.clear();
    },
}));
