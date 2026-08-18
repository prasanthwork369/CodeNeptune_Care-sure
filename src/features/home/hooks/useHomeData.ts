import { useFeaturedSubcategories } from "@/src/features/home/hooks/useFeaturedSubcategories";
import { useAddress } from "@/src/features/profile/hooks/useAddress";
import { useFeaturedMedicines } from "@/src/features/product/hooks/useFeaturedMedicines";
import { useHome } from "@/src/features/home/hooks/useHome";
import { useFrequentlyOrdered } from "@/src/features/orders/hooks/useOrders";
import { useAuthStore } from "@/src/store/authStore";
import { useLocationStore } from "@/src/store/locationStore";
import {
  addressToLocation,
  pickDefaultAddress,
} from "@/src/utils/addressLocation";
import { useCallback, useEffect, useState } from "react";
import { InteractionManager } from "react-native";
import { queryClient } from "@/src/lib/react-query/queryClient";
import { syncService } from "@/src/services/sync.service";

export function useHomeData() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  // Field selectors, or any location write re-renders the entire feed.
  const setLocation = useLocationStore((s) => s.setLocation);
  const clearLocation = useLocationStore((s) => s.clearLocation);
  const hasHydrated = useLocationStore((s) => s.hasHydrated);

  useEffect(() => {
    // Runs up to 5 of its own sequential fetches on top of this hook's own
    // queries below — deferred so it doesn't compete with the tab transition
    // and the feed's first paint for JS-thread/network time.
    //
    // InteractionManager is deprecated in favor of requestIdleCallback, but
    // intentionally NOT swapped here: requestIdleCallback fires once the JS
    // thread looks idle, which can be immediately if the tab transition runs
    // on the UI thread (Reanimated/native driver) — exactly the race this
    // defer exists to avoid. runAfterInteractions still waits on RN's touch/
    // animation interaction handles, which is the guarantee this code needs.
    const task = InteractionManager.runAfterInteractions(() => {
      syncService.performSync(queryClient, isAuthenticated).catch((err) => {
        if (__DEV__) console.error("[Sync] Background sync check failed:", err);
      });
    });
    return () => task.cancel();
  }, [isAuthenticated]);

  const {
    tabs,
    cards,
    appContent,
    isLoading: isHomeLoading,
    error: homeError,
    refetch: refetchHome,
  } = useHome();
  const {
    products: featuredProducts,
    isLoading: isFeaturedLoading,
    error: featuredError,
    refetch: refetchFeatured,
  } = useFeaturedMedicines();
  const {
    subcategories: featuredSubcategories,
    isLoading: isSubcategoriesLoading,
    error: subcategoriesError,
    refetch: refetchSubcategories,
  } = useFeaturedSubcategories();
  const {
    addresses,
    loaded: addressesLoaded,
    refetch: refetchAddresses,
  } = useAddress();
  const { data: frequentlyOrdered = [], refetch: refetchFrequentlyOrdered } =
    useFrequentlyOrdered({ limit: 5 });

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Records the resolved default as the concrete selection, and clears a stale
  // location once the last address is gone. The header no longer depends on
  // this — it derives from the address via useDeliveryAddress — but writing the
  // pick down keeps it persisted and tells onboarding not to chase a GPS fix.
  useEffect(() => {
    if (!isAuthenticated) return;
    // The persisted pick arrives asynchronously. Seeding before it lands would
    // read selectedAddressId as null and overwrite the restored choice with the
    // default, so a restart could silently move the user's address.
    if (!hasHydrated) return;
    // `addresses` is [] while the request is still in flight, which is
    // indistinguishable from "this user has no addresses". Acting on that empty
    // list would clear the restored pick on every cold start and then re-seed
    // the default — the exact reset this guard exists to prevent.
    if (!addressesLoaded) return;

    const defaultAddr = pickDefaultAddress(addresses);
    if (!defaultAddr) {
      clearLocation();
      return;
    }
    // Only a fallback: a location the user picked must survive an address
    // refetch. Re-seed it only once their choice is gone (e.g. deleted).
    const { selectedAddressId } = useLocationStore.getState();
    const choiceStillExists =
      !!selectedAddressId && addresses.some((a) => a.id === selectedAddressId);
    if (choiceStillExists) return;

    const { location, addressId, pincode } = addressToLocation(defaultAddr);
    setLocation(location, { addressId, pincode });
  }, [
    addresses,
    isAuthenticated,
    hasHydrated,
    addressesLoaded,
    setLocation,
    clearLocation,
  ]);

  // Stable so Home's memoized RefreshControl isn't rebuilt on every render.
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // allSettled (not all): keep the spinner up until EVERY refetch settles
      // and the 800ms floor elapses. With Promise.all, a single refetch that
      // rejects (network hiccup, a failing endpoint) short-circuits the whole
      // wait, hiding the indicator instantly even though the refresh is ongoing.
      await Promise.allSettled([
        refetchHome(),
        refetchFeatured(),
        refetchSubcategories(),
        refetchAddresses(),
        refetchFrequentlyOrdered(),
        new Promise<void>((resolve) => setTimeout(resolve, 800)),
      ]);
    } catch (e) {
      if (__DEV__) console.error("[Home] Refresh failed:", e);
    } finally {
      setIsRefreshing(false);
    }
  }, [
    refetchHome,
    refetchFeatured,
    refetchSubcategories,
    refetchAddresses,
    refetchFrequentlyOrdered,
  ]);

  return {
    tabs,
    cards,
    appContent,
    isHomeLoading,
    featuredProducts,
    isFeaturedLoading,
    featuredSubcategories,
    isSubcategoriesLoading,
    addresses,
    frequentlyOrdered,
    error: homeError || featuredError || subcategoriesError,
    isRefreshing,
    onRefresh,
  };
}
