import { useAddress } from "@/src/hooks/queries/useAddress";
import { useFeaturedMedicines } from "@/src/hooks/queries/useFeaturedMedicines";
import { useFeaturedSubcategories } from "@/src/hooks/queries/useFeaturedSubcategories";
import { useHome } from "@/src/hooks/queries/useHome";
import { useFrequentlyOrdered } from "@/src/hooks/queries/useOrders";
import { useAuthStore } from "@/src/store/authStore";
import { useLocationStore } from "@/src/store/locationStore";
import { useEffect, useState } from "react";

export function useHomeData() {
  const { isAuthenticated } = useAuthStore();
  const { setLocation, clearLocation } = useLocationStore();

  const { tabs, cards, appContent, isLoading: isHomeLoading, refetch: refetchHome } = useHome();
  const { products: featuredProducts, isLoading: isFeaturedLoading, refetch: refetchFeatured } = useFeaturedMedicines();
  const { subcategories: featuredSubcategories, isLoading: isSubcategoriesLoading, refetch: refetchSubcategories } = useFeaturedSubcategories();
  const { addresses, refetch: refetchAddresses } = useAddress();
  const { data: frequentlyOrdered = [], refetch: refetchFrequentlyOrdered } = useFrequentlyOrdered({ limit: 5 });

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sync default address into location store
  useEffect(() => {
    if (!isAuthenticated) return;
    if (addresses.length > 0) {
      const defaultAddr = addresses.find((a) => a.isDefault) ?? addresses[0];
      setLocation(
        { label: defaultAddr.label, city: defaultAddr.city || defaultAddr.line2 || "" },
        { addressId: defaultAddr.id, pincode: defaultAddr.pincode },
      );
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
      console.error("[Home] Refresh failed:", e);
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
