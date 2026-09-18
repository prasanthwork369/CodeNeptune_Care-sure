/**
 * Optimization Module - Export all optimization utilities
 *
 * Usage:
 * import { lazy, VirtualizedList, useCleanup } from '@/src/features/optimization';
 */

// Code Splitting & Lazy Loading
export { useLazyComponent, preloadComponent, preloadComponents, LoadingFallback } from './utils/lazyLoad';

// Virtual Scrolling
export { VirtualizedList, VirtualizedSectionList } from './components/VirtualizedList';

// Font Optimization
export {
  FONT_WEIGHTS,
  FONT_FAMILIES,
  FONT_OPTIMIZATION_STYLES,
  FONT_SUBSETS,
  FONT_LOADING_CONFIG,
  preloadFonts,
  getFontSubsetForLocale,
} from './utils/fontOptimization';

// Memory Optimization
export {
  WeakCache,
  BoundedCache,
  useCleanup,
  useMemoryLimitedCache,
  useDebounced,
  useAbortableAsync,
  formatMemorySize,
  logMemoryStats,
} from './utils/memoryOptimization';
