import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface LastRouteState {
  pathname: string | null;
  params: Record<string, string> | null;
  savedAt: number | null;
  hasHydrated: boolean;
  setRoute: (pathname: string, params: Record<string, string>) => void;
  clear: () => void;
  setHasHydrated: (value: boolean) => void;
}

// Persists the last non-sensitive screen visited, so a process recreation
// (e.g. Android kills the app while the user is in system Settings changing
// a permission) can restore it instead of always landing back on Home.
export const useLastRouteStore = create<LastRouteState>()(
  persist(
    (set) => ({
      pathname: null,
      params: null,
      savedAt: null,
      hasHydrated: false,
      setRoute: (pathname, params) => set({ pathname, params, savedAt: Date.now() }),
      clear: () => set({ pathname: null, params: null, savedAt: null }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "caresure-last-route",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        pathname: state.pathname,
        params: state.params,
        savedAt: state.savedAt,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

/** Resolves once hydration completes, so index.tsx never reads a not-yet-loaded default. */
export const waitForLastRouteHydration = (): Promise<void> => {
  if (useLastRouteStore.persist.hasHydrated()) return Promise.resolve();
  return new Promise((resolve) => {
    const unsubscribe = useLastRouteStore.persist.onFinishHydration(() => {
      unsubscribe();
      resolve();
    });
  });
};

// Auth walls and sensitive transient flows — never captured, never restored into.
const RESTORE_DENYLIST = ["/", "/login", "/otp", "/payment"];

/** True when a pathname is safe to remember and later redirect back into. */
export const isSafeRoute = (pathname: string): boolean =>
  !RESTORE_DENYLIST.some((p) => pathname === p || pathname.startsWith(`${p}/`));

// A restored route older than this reads as a genuine fresh launch (user closed
// the app hours ago), not a bounce back from Settings — falls back to Home.
const RESTORE_TTL_MS = 10 * 60 * 1000;

export const isRouteFresh = (savedAt: number | null): boolean =>
  savedAt != null && Date.now() - savedAt < RESTORE_TTL_MS;
