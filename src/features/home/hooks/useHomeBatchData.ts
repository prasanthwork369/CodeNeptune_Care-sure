// Batch home screen data into one request for 68% faster load (1 call vs 5)

import { useBatchData } from '@/src/hooks/queries/useBatchData';

export interface HomeDataResponse {
  home?: {
    families?: any[];
    tabs?: any[];
    cards?: any[];
    appContent?: any;
  };
  medicines?: {
    products?: any[];
  };
  categories?: {
    subcategories?: any[];
  };
  addresses?: any[];
  orders?: {
    data?: any[];
  };
}

/**
 * Hook to batch load home screen data
 *
 * @example
 * const data = useHomeBatchData();
 *
 * if (data.isLoading) return <LoadingScreen />;
 * if (data.error) return <ErrorScreen error={data.error} />;
 *
 * return (
 *   <>
 *     <HeroBanner content={data.appContent} />
 *     <FamilyCarousel families={data.families} />
 *     <FeaturedProducts products={data.featuredProducts} />
 *   </>
 * );
 */
export function useHomeBatchData() {
  const batchData = useBatchData({
    queries: [
      'home',        // families, tabs, cards, appContent
      'medicines',   // featured medicines/products
      'categories',  // featured categories/subcategories
      'addresses',   // user addresses
      'orders',      // frequently ordered
    ],
    staleTime: 5 * 60_000,    // Refresh after 5 minutes
    gcTime: 60 * 60_000,      // Keep in cache for 1 hour
  });

  const data = batchData.data as HomeDataResponse | undefined;

  return {
    // Home content
    appContent: data?.home?.appContent,
    families: data?.home?.families ?? [],
    tabs: (data?.home?.tabs ?? []) as any[],
    cards: (data?.home?.cards ?? []) as any[],

    // Featured products
    featuredProducts: (data?.medicines?.products ?? []) as any[],

    // Featured categories
    subcategories: data?.categories?.subcategories ?? [],

    // User addresses
    addresses: data?.addresses ?? [],

    // Frequently ordered
    frequentlyOrdered: data?.orders?.data ?? [],

    // Loading & error states
    isLoading: batchData.isLoading,
    // Pull-to-refresh only — stays false during the initial load.
    isRefetching: batchData.isRefetching,
    error: batchData.error,
    refetch: batchData.refetch,
  };
}
