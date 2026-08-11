import { create } from "zustand";
import { tokenStorage, guestStorage } from "@/src/lib/storage";
import { profileApi, CustomerProfile } from "../api/profile.api";
import { setAccessToken } from "../api/client";
import { queryClient } from "@/src/lib/react-query/queryClient";
import { QUERY_KEYS } from "@/src/lib/react-query/queryKeys";
import { apiCache } from "@/src/lib/sqlite/cache";
import { usePrescriptionDraftStore } from "./prescriptionDraftStore";
import { useCheckoutDraftStore } from "./checkoutDraftStore";
import { useCouponStore } from "./couponStore";
import { useNotificationStore } from "./notificationStore";
import { useLocationStore } from "./locationStore";
import { useCheckoutStore } from "./checkoutStore";
import { useReturnDraftStore } from "./returnDraftStore";
import { usePrescriptionOrderStore } from "./prescriptionOrderStore";
import { useCartPendingStore } from "./cartStore";
import { AppError } from "../api/errors";

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

        // Load from cache instantly, then refresh in the background.
        const cachedProfile = apiCache.get<CustomerProfile>("customer_profile");
        set({
          token,
          isAuthenticated: true,
          user: cachedProfile,
          isLoaded: true,
        });

        profileApi
          .getProfile()
          .then((profile) => {
            set({ user: profile });
            apiCache.set("customer_profile", profile);
            // Seed React Query too, or useProfile (mounted by the tabs layout)
            // fires a second identical request on every cold start.
            queryClient.setQueryData(QUERY_KEYS.CUSTOMER.PROFILE, profile);
          })
          .catch(async (err) => {
            // Only drop the session on a confirmed auth failure (401/403).
            // A network, timeout, or 5xx error at startup must keep the
            // user signed in so offline launches work off the cached profile.
            const isAuthFailure =
              err instanceof AppError &&
              (err.status === 401 || err.status === 403);
            if (isAuthFailure) {
              await get().logout();
            }
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
    useCheckoutStore.getState().clear();
    useReturnDraftStore.getState().clearReturnDraft();
    usePrescriptionOrderStore.getState().clear();
    useCartPendingStore.getState().clearGuestCart();
    useCheckoutDraftStore.getState().clearDraft();
    queryClient.clear();
    // Whole cache, not just the profile: frequently_ordered is user-specific
    // too, and withSqliteCache serves stale entries whenever a fetch fails.
    apiCache.clear();

    await tokenStorage.clear();
    await tokenStorage.clearExpiresAt();
    await tokenStorage.clearRefreshToken();
    await tokenStorage.clearAvatarUri();
    await guestStorage.clear();
  },
}));
