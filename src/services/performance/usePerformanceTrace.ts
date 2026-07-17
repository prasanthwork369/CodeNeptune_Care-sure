import { useCallback, useEffect, useRef } from "react";
import { perfService } from "./perfService";
import { UsePerformanceTraceOptions } from "./types";

/**
 * Enterprise Custom Hook for Firebase Performance Monitoring.
 *
 * Encapsulates full lifecycle trace management:
 * - Automatically starts trace on mount (or manual invocation).
 * - Stops trace when `isLoading` becomes false.
 * - Guarantees trace cleanup on component unmount to prevent memory leaks.
 * - Avoids extra re-renders by tracking state internally with refs.
 */
export function usePerformanceTrace({
  traceName,
  isLoading,
  attributes,
  metrics,
  manualStart = false,
}: UsePerformanceTraceOptions) {
  const hasStartedRef = useRef(false);

  const start = useCallback(() => {
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      perfService.startTrace(traceName, attributes, metrics);
    }
  }, [traceName, attributes, metrics]);

  const stop = useCallback(
    (additionalAttributes?: typeof attributes, additionalMetrics?: typeof metrics) => {
      if (hasStartedRef.current || perfService.isTraceActive(traceName)) {
        perfService.stopTrace(traceName, additionalAttributes, additionalMetrics);
        hasStartedRef.current = false;
      }
    },
    [traceName]
  );

  // Auto-start on mount unless manualStart is requested
  useEffect(() => {
    if (!manualStart && !hasStartedRef.current) {
      start();
    }

    return () => {
      if (hasStartedRef.current || perfService.isTraceActive(traceName)) {
        perfService.stopTrace(traceName);
        hasStartedRef.current = false;
      }
    };
  }, [manualStart, start, stop, traceName]);

  // Auto-stop when isLoading transitions to false
  useEffect(() => {
    if (isLoading === false && (hasStartedRef.current || perfService.isTraceActive(traceName))) {
      stop();
    }
  }, [isLoading, stop, traceName]);

  return {
    start,
    stop,
    isActive: () => perfService.isTraceActive(traceName),
  };
}
