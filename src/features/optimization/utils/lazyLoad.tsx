/**
 * Lazy loading utilities for code splitting
 * Reduces initial bundle by deferring non-critical modules
 */

import React, { ComponentType } from 'react';
import { View, ActivityIndicator } from 'react-native';

/**
 * Loading fallback component
 */
export const LoadingFallback = () => (
  <View className="flex-1 items-center justify-center bg-white">
    <ActivityIndicator size="large" color="#0066CC" />
  </View>
);

/**
 * Lazy load a component with loading state
 * React Native compatible version
 * @example
 * const { ProfileScreen } = useLazyComponent(() => import('./ProfileScreen'));
 * // Use with: <ProfileScreen />
 */
export function useLazyComponent<P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
): { Component: ComponentType<P> | null; isLoading: boolean } {
  const [Component, setComponent] = React.useState<ComponentType<P> | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;

    importFunc()
      .then((module) => {
        if (isMounted) {
          setComponent(() => module.default);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('[LazyComponent] Failed to load:', err);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [importFunc]);

  return { Component, isLoading };
}

/**
 * Preload a lazy component before rendering
 * @example
 * preloadComponent(() => import('./ExpensiveComponent'));
 */
export function preloadComponent(
  importFunc: () => Promise<any>,
) {
  importFunc().catch((err) => {
    console.warn('[Preload] Failed to preload component:', err);
  });
}

/**
 * Batch preload multiple components
 * Useful for prefetching components on app startup
 * @example
 * preloadComponents([
 *   () => import('./ProfileScreen'),
 *   () => import('./CheckoutScreen'),
 * ]);
 */
export function preloadComponents(
  importFuncs: Array<() => Promise<any>>,
) {
  importFuncs.forEach((importFunc) => {
    preloadComponent(importFunc);
  });
}
