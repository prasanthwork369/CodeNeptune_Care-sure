import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface LastRouteState {
  pathname: string | null;
  params: Record<string, string> | null;
  // Only true while we're mid round-trip to Android Settings for a
  // permission change — the sole condition under which index.tsx restores.
  pendingRestore: boolean;
  hasHydrated: boolean;
  setRoute: (pathname: string, params: Record<string, string>) => void;
  armPendingRestore: () => void;
  clearPendingRestore: () => void;
  clear: () => void;
  setHasHydrated: (value: boolean) => void;
}

// Persists the last non-sensitive screen visited, so a process recreation
// caused by an intentional trip to system Settings (changing a permission)
// can restore it instead of landing back on Home.
export const useLastRouteStore = create<LastRouteState>()(
  persist(
    (set) => ({
      pathname: null,
      params: null,
      pendingRestore: false,
      hasHydrated: false,
      setRoute: (pathname, params) => set({ pathname, params }),
      armPendingRestore: () => set({ pendingRestore: true }),
      clearPendingRestore: () => set({ pendingRestore: false }),
      clear: () => set({ pathname: null, params: null, pendingRestore: false }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "caresure-last-route",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        pathname: state.pathname,
        params: state.params,
        pendingRestore: state.pendingRestore,
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

/**
 * Call right before Linking.openSettings() (or an intent that lands the user
 * in system Settings) for a permission change. Arms a one-shot restore for
 * the process recreation that trip can cause — never for an ordinary launch.
 */
export const armSettingsReturn = (): void => {
  useLastRouteStore.getState().armPendingRestore();
};
