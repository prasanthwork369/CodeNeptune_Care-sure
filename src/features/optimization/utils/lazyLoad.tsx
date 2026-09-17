/**
 * Lazy loading utilities for code splitting
 * Reduces initial bundle by deferring non-critical modules
 */

import React, { Suspense, ComponentType } from 'react';
import { View, ActivityIndicator } from 'react-native';

/**
 * Loading fallback component
 */
const LoadingFallback = () => (
  <View className="flex-1 items-center justify-center bg-white">
    <ActivityIndicator size="large" color="#0066CC" />
  </View>
);

/**
 * Lazy load a component with loading state
 * @example
 * const ProfileScreen = lazy(() => import('./ProfileScreen'));
 * // Use with: <ProfileScreen />
 */
export function lazy<P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
) {
  const Component = React.lazy(importFunc);
  return (props: P) => (
    <Suspense fallback={<LoadingFallback />}>
      <Component {...props} />
    </Suspense>
  );
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
