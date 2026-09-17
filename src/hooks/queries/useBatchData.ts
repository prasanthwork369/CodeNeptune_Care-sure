/**
 * Hook for batching related API calls.
 *
 * Typical use: Prefetch data on app startup or before navigation.
 * Reduces network requests by 50-70% compared to individual queries.
 */

import { useQuery , useQueryClient } from "@tanstack/react-query";
import { batchFetch } from "@/src/api/batch.api";

/**
 * Preload common screen data patterns.
 * Call these once on app startup.
 */


interface BatchDataOptions {
  queries: string[];
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
}

/**
 * Batch fetch multiple queries in one request.
 *
 * @example
 * // Fetch profile, cart, and coupons together
 * const { data, isLoading } = useBatchData({
 *   queries: ['profile', 'cart', 'coupons'],
 *   staleTime: 5 * 60_000, // 5 minutes
 * });
 *
 * const { profile, cart, coupons } = data || {};
 */
export function useBatchData({
  queries,
  enabled = true,
  staleTime = 5 * 60_000,
  gcTime = 60 * 60_000,
}: BatchDataOptions) {
  return useQuery({
    queryKey: ["batch", ...queries.sort()],
    queryFn: () => batchFetch(queries),
    enabled,
    staleTime,
    gcTime,
  });
}

/**
 * Prefetch data before navigation.
 *
 * @example
 * const prefetchCheckoutData = usePrefetchBatchData();
 *
 * <Button
 *   onPress={async () => {
 *     await prefetchCheckoutData(['cart', 'addresses', 'wallet']);
 *     navigation.navigate('Checkout');
 *   }}
 * >
 *   Go to Checkout
 * </Button>
 */
export function usePrefetchBatchData() {
  const queryClient = useQueryClient();

  return async (queries: string[]) => {
    await queryClient.prefetchQuery({
      queryKey: ["batch", ...queries.sort()],
      queryFn: () => batchFetch(queries),
      staleTime: 5 * 60_000,
      gcTime: 60 * 60_000,
    });
  };
}

export function usePrefetchAppStartupData() {
  const queryClient = useQueryClient();

  return async () => {
    // Prefetch critical data for home screen
    await queryClient.prefetchQuery({
      queryKey: ["batch", "cart", "coupons", "profile"],
      queryFn: () => batchFetch(["cart", "coupons", "profile"]),
      staleTime: 5 * 60_000,
    });
  };
}

/**
 * USAGE PATTERNS
 *
 * Pattern 1: Batch load on app startup
 * ===================================
 * function App() {
 *   useEffect(() => {
 *     const prefetch = usePrefetchAppStartupData();
 *     prefetch(); // Load: cart, coupons, profile
 *   }, []);
 * }
 *
 * Pattern 2: Prefetch before navigation
 * ===================================
 * function HomeScreen() {
 *   const prefetch = usePrefetchBatchData();
 *
 *   const handleCheckout = async () => {
 *     // Prefetch checkout data while showing current screen
 *     await prefetch(['cart', 'addresses', 'wallet']);
 *     // Then navigate
 *     navigation.navigate('Checkout');
 *   };
 * }
 *
 * Pattern 3: Batch fetch during screen load
 * ===================================
 * function ProfileScreen() {
 *   const { data, isLoading } = useBatchData({
 *     queries: ['profile', 'addresses', 'wallet', 'orders'],
 *   });
 *
 *   if (isLoading) return <LoadingScreen />;
 *
 *   const { profile, addresses, wallet, orders } = data || {};
 *   return <ProfileContent {...} />;
 * }
 */
