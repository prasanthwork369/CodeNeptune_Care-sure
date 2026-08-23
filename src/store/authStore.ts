import { create } from "zustand";
import { tokenStorage, guestStorage } from "@/src/lib/storage";
import type { CustomerProfile } from "../features/profile/types";
import { setAccessToken } from "../api/client";
import { queryClient } from "@/src/lib/react-query/queryClient";
import { apiCache } from "@/src/lib/sqlite/cache";
import { usePrescriptionDraftStore } from "./prescriptionDraftStore";
import { useLastRouteStore } from "./lastRouteStore";
import { useCheckoutDraftStore } from "./checkoutDraftStore";
import { useCouponStore } from "./couponStore";
import { useNotificationStore } from "./notificationStore";
import { useLocationStore } from "./locationStore";
import { useCheckoutStore } from "./checkoutStore";
import { useReturnDraftStore } from "./returnDraftStore";
import { usePrescriptionOrderStore } from "./prescriptionOrderStore";
import { useCartPendingStore } from "./cartStore";

interface AuthState {
  isAuthenticated: boolean;
  isGuest: boolean; // True if browsing as guest
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

        // Load from SQLite cache for instant paint; refreshed in background
        const cachedProfile = apiCache.get<CustomerProfile>("customer_profile");
        set({
          token,
          isAuthenticated: true,
          user: cachedProfile,
          isLoaded: true,
        });
      } else {
        const isGuest = await guestStorage.get();
        set({ isGuest, isLoaded: true });
      }
    } catch (error) {
      if (__DEV__) console.error("Auth initialization failed:", error);
      set({ isLoaded: true });
    }
  },

  login: async (token: string, expiresIn: number) => {
    const expiresAt = Date.now() + expiresIn * 1000;
    setAccessToken(token); // set in-memory immediately
    set({ isAuthenticated: true, isGuest: false, token });
    // Concurrently persist tokens and clear guest state
    await Promise.all([
      tokenStorage.set(token),
      tokenStorage.setExpiresAt(expiresAt),
      guestStorage.clear(),
    ]);
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
    useCheckoutStore.getState().clear();
    useReturnDraftStore.getState().clearReturnDraft();
    usePrescriptionOrderStore.getState().clear();
    useCartPendingStore.getState().clearGuestCart();
    useCheckoutDraftStore.getState().clearDraft();
    useLastRouteStore.getState().clear();
    queryClient.clear();
    // Clear entire user cache on logout
    apiCache.clear();

    await tokenStorage.clear();
    await tokenStorage.clearExpiresAt();
    await tokenStorage.clearRefreshToken();
    await guestStorage.clear();
  },
}));
