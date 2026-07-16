import { useFeaturedSubcategories } from "@/src/hooks/home/useFeaturedSubcategories";
import { useAddress } from "@/src/hooks/queries/useAddress";
import { useFeaturedMedicines } from "@/src/hooks/queries/useFeaturedMedicines";
import { useHome } from "@/src/hooks/queries/useHome";
import { useFrequentlyOrdered } from "@/src/hooks/queries/useOrders";
import { useAuthStore } from "@/src/store/authStore";
import { useLocationStore } from "@/src/store/locationStore";
import { addressToLocation, pickDefaultAddress } from "@/src/utils/addressLocation";
import { useEffect, useState } from "react";
import { queryClient } from "@/src/lib/react-query/queryClient";
import { syncService } from "@/src/services/sync.service";

export function useHomeData() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { setLocation, clearLocation } = useLocationStore();
  const hasHydrated = useLocationStore((s) => s.hasHydrated);

  useEffect(() => {
    syncService.performSync(queryClient, isAuthenticated).catch((err) => {
      if (__DEV__) console.error("[Sync] Background sync check failed:", err);
    });
  }, [isAuthenticated]);

  const {
    tabs,
    cards,
    appContent,
    isLoading: isHomeLoading,
    refetch: refetchHome,
  } = useHome();
  const {
    products: featuredProducts,
    isLoading: isFeaturedLoading,
    refetch: refetchFeatured,
  } = useFeaturedMedicines();
  const {
    subcategories: featuredSubcategories,
    isLoading: isSubcategoriesLoading,
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
  }, [addresses, isAuthenticated, hasHydrated, addressesLoaded]);

  const onRefresh = async () => {
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
  };

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
    isRefreshing,
    onRefresh,
  };
}
