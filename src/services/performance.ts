/**
 * Performance measurement and monitoring
 * Tracks: API call times, render performance, bundle size
 */

import { firebase } from '@react-native-firebase/app';
import perf from '@react-native-firebase/perf';

export enum PerformanceTraces {
  HOME_SCREEN_LOAD = 'home_screen_load',
  CART_SCREEN_LOAD = 'cart_screen_load',
  CHECKOUT_SCREEN_LOAD = 'checkout_screen_load',
  PROFILE_SCREEN_LOAD = 'profile_screen_load',
  HOME_BATCH_API = 'home_batch_api_call',
  CART_BATCH_API = 'cart_batch_api_call',
  CHECKOUT_BATCH_API = 'checkout_batch_api_call',
  PROFILE_BATCH_API = 'profile_batch_api_call',
  IMAGE_LOAD = 'image_load',
}

class PerformanceMonitor {
  private traces: Map<string, any> = new Map();

  startTrace(name: PerformanceTraces, metadata?: Record<string, string>) {
    try {
      const trace = perf().newTrace(name);
      if (metadata) {
        Object.entries(metadata).forEach(([key, value]) => {
          trace.putAttribute(key, value);
        });
      }
      trace.start();
      this.traces.set(name, trace);
      return trace;
    } catch (e) {
      console.warn(`[Perf] Failed to start trace ${name}:`, e);
      return null;
    }
  }

  endTrace(name: PerformanceTraces) {
    const trace = this.traces.get(name);
    if (trace) {
      try {
        trace.stop();
        this.traces.delete(name);
      } catch (e) {
        console.warn(`[Perf] Failed to end trace ${name}:`, e);
      }
    }
  }

  recordCounter(name: string, value: number) {
    try {
      const trace = perf().newTrace(name);
      trace.putMetric(name, value);
      trace.start();
      trace.stop();
    } catch (e) {
      console.warn(`[Perf] Failed to record metric ${name}:`, e);
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();

/**
 * Measure API call duration
 * @example
 * const result = await measureAPICall(
 *   'batch_home',
 *   () => fetchHomeBatchData(),
 * );
 */
export async function measureAPICall<T>(
  label: string,
  fn: () => Promise<T>,
): Promise<T> {
  const startTime = Date.now();
  try {
    const result = await fn();
    const duration = Date.now() - startTime;
    performanceMonitor.recordCounter(`api_${label}_ms`, duration);
    console.log(`[API] ${label}: ${duration}ms`);
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    performanceMonitor.recordCounter(`api_${label}_error_ms`, duration);
    console.error(`[API] ${label} failed after ${duration}ms`, error);
    throw error;
  }
}

/**
 * Measure component render time
 * @example
 * useEffect(() => {
 *   const end = measureRender('HomeLayout');
 *   return () => end();
 * }, []);
 */
export function measureRender(componentName: string) {
  const startTime = performance.now();
  return () => {
    const duration = performance.now() - startTime;
    performanceMonitor.recordCounter(`render_${componentName}_ms`, duration);
    console.log(`[Render] ${componentName}: ${duration.toFixed(2)}ms`);
  };
}
