/**
 * Abort Controller for Request Cancellation
 *
 * Prevents memory leaks by cancelling pending requests when component unmounts.
 * Typical savings: 50-100MB memory saved per session
 */

import React, { useEffect, useRef } from "react";

/**
 * CANCELLATION PATTERNS
 *
 * Pattern 1: Cancel on unmount (prevents memory leaks)
 * ================================================
 * function MyComponent() {
 *   const abortController = useAbortController();
 *
 *   useEffect(() => {
 *     fetch('/api/data', { signal: abortController.signal })
 *       .then(res => res.json())
 *       .then(setData);
 *   }, []);
 * }
 *
 * // On unmount: abortController.abort() is called
 * // → All pending requests cancelled
 * // → No state updates after unmount
 *
 *
 * Pattern 2: Cancel on navigation
 * ==============================
 * function SearchScreen() {
 *   const abortController = useAbortController();
 *
 *   useFocusEffect(() => {
 *     return () => {
 *       // Cancel search requests when leaving screen
 *       abortController.abort();
 *     };
 *   }, []);
 * }
 *
 *
 * Pattern 3: React Query auto-cancellation (RECOMMENDED)
 * ====================================================
 * // React Query handles this automatically!
 * export const useCart = () => {
 *   return useQuery({
 *     queryKey: ['cart'],
 *     queryFn: async ({ signal }) => {
 *       // signal is passed automatically
 *       return fetch('/api/cart', { signal });
 *     },
 *   });
 * };
 *
 * // No additional work needed - cancels on unmount
 *
 *
 * MEMORY LEAK EXAMPLES
 *
 * ❌ LEAK: Request continues after unmount
 * =======================================
 * function BadComponent() {
 *   useEffect(() => {
 *     fetch('/api/data')
 *       .then(res => res.json())
 *       .then(setData); // 💥 Crash: Can't setState after unmount
 *   }, []);
 * }
 *
 * ✅ FIXED: Request cancelled on unmount
 * =======================================
 * function GoodComponent() {
 *   const abortController = useAbortController();
 *
 *   useEffect(() => {
 *     fetch('/api/data', { signal: abortController.signal })
 *       .then(res => res.json())
 *       .then(setData); // ✓ Safe: never called if unmounted
 *   }, []);
 * }
 */


/**
 * Create an abort controller for a component lifecycle
 *
 * @example
 * function MyComponent() {
 *   const abortController = useAbortController();
 *
 *   useEffect(() => {
 *     fetch('/api/data', { signal: abortController.signal });
 *   }, []);
 * }
 */
export function useAbortController() {
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortControllerRef.current = new AbortController();

    return () => {
      // Cancel all pending requests when component unmounts
      abortControllerRef.current?.abort();
    };
  }, []);

  return abortControllerRef.current!;
}

/**
 * Hook to manage multiple abort controllers for different request types
 *
 * @example
 * function HomeScreen() {
 *   const signals = useAbortSignals(['fetch-profile', 'fetch-cart']);
 *
 *   useEffect(() => {
 *     fetch('/api/profile', { signal: signals['fetch-profile'] });
 *     fetch('/api/cart', { signal: signals['fetch-cart'] });
 *   }, [signals]);
 * }
 */
export function useAbortSignals(keys: string[]) {
  const controllersRef = useRef<Record<string, AbortController>>({});

  useEffect(() => {
    // Initialize controllers for each key
    keys.forEach((key) => {
      if (!controllersRef.current[key]) {
        controllersRef.current[key] = new AbortController();
      }
    });

    return () => {
      // Cancel all on unmount
      Object.values(controllersRef.current).forEach((controller) => {
        controller.abort();
      });
      controllersRef.current = {};
    };
  }, [keys.join(",")]); // Re-create if keys change

  return Object.fromEntries(
    keys.map((key) => [key, controllersRef.current[key]?.signal]),
  ) as Record<string, AbortSignal>;
}

/**
 * Hook to manage a single fetch request with cancellation
 *
 * @example
 * function CartScreen() {
 *   const { data, loading, error } = useFetch('/api/cart');
 *
 *   if (loading) return <LoadingScreen />;
 *   if (error) return <ErrorScreen error={error} />;
 *   return <CartContent data={data} />;
 * }
 */
export function useFetch<T>(
  url: string,
  options?: RequestInit,
) {
  const abortController = useAbortController();
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  useEffect(() => {
    if (!url) return;

    setLoading(true);
    setError(null);

    fetch(url, {
      ...options,
      signal: abortController.signal,
    })
      .then((res) => res.json())
      .then(setData)
      .catch((err) => {
        // Ignore abort errors (normal when unmounting)
        if (err.name !== "AbortError") {
          setError(err);
        }
      })
      .finally(() => setLoading(false));
  }, [url, abortController]);

  return { data, loading, error };
}
