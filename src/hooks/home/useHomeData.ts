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
  const { addresses, refetch: refetchAddresses } = useAddress();
  const { data: frequentlyOrdered = [], refetch: refetchFrequentlyOrdered } =
    useFrequentlyOrdered({ limit: 5 });

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sync default address into location store — this is what fills the home
  // header for returning users who skip the location permission.
  useEffect(() => {
    if (!isAuthenticated) return;
    const defaultAddr = pickDefaultAddress(addresses);
    if (defaultAddr) {
      const { location, addressId, pincode } = addressToLocation(defaultAddr);
      setLocation(location, { addressId, pincode });
    } else {
      clearLocation();
    }
  }, [addresses, isAuthenticated]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
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
