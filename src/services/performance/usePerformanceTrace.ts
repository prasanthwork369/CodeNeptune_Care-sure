import { useCallback, useEffect, useRef } from "react";
import { AppState } from "react-native";
import { perfService } from "./perfService";
import { TraceAttributes, TraceMetrics, UsePerformanceTraceOptions } from "./types";

// Screen loads should finish in seconds; anything longer is a missed stop, not
// a slow load. The cap keeps such samples from inflating the Firebase average.
const DEFAULT_MAX_DURATION_MS = 20_000;

/**
 * Enterprise Custom Hook for Firebase Performance Monitoring.
 *
 * Encapsulates full lifecycle trace management:
 * - Automatically starts trace on mount (or manual invocation).
 * - Stops trace when `isLoading` becomes false.
 * - Force-stops after `maxDurationMs` so a missed stop can't report minutes.
 * - Stops when the app is backgrounded (a screen load shouldn't span background time).
 * - Guarantees trace cleanup on component unmount to prevent memory leaks.
 * - Avoids extra re-renders by tracking state internally with refs.
 */
export function usePerformanceTrace({
  traceName,
  isLoading,
  attributes,
  metrics,
  manualStart = false,
  maxDurationMs = DEFAULT_MAX_DURATION_MS,
}: UsePerformanceTraceOptions) {
  const hasStartedRef = useRef(false);

  const start = useCallback((startAttributes?: TraceAttributes, startMetrics?: TraceMetrics) => {
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      perfService.startTrace(
        traceName,
        startAttributes ?? attributes,
        startMetrics ?? metrics,
        maxDurationMs,
      );
    }
  }, [traceName, attributes, metrics, maxDurationMs]);

  const stop = useCallback(
    (additionalAttributes?: typeof attributes, additionalMetrics?: typeof metrics) => {
      if (hasStartedRef.current || perfService.isTraceActive(traceName)) {
        perfService.stopTrace(traceName, additionalAttributes, additionalMetrics);
        hasStartedRef.current = false;
      }
    },
    [traceName]
  );

  // Auto-start on mount unless manualStart is requested. Skip when the screen is
  // already loaded (isLoading === false at mount) — there is nothing to measure,
  // and starting would leave a trace running until unmount.
  useEffect(() => {
    if (!manualStart && isLoading === true && !hasStartedRef.current) {
      start();
    }

    return () => {
      if (hasStartedRef.current || perfService.isTraceActive(traceName)) {
        perfService.stopTrace(traceName);
        hasStartedRef.current = false;
      }
    };
  }, [isLoading, manualStart, start, traceName]);

  // Auto-stop when isLoading transitions to false
  useEffect(() => {
    if (isLoading === false && (hasStartedRef.current || perfService.isTraceActive(traceName))) {
      stop();
    }
  }, [isLoading, stop, traceName]);

  // A screen load shouldn't span time in the background — end it (tagged so it
  // can be filtered out) when the app leaves the foreground.
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state !== "active" && (hasStartedRef.current || perfService.isTraceActive(traceName))) {
        stop({ backgrounded: "true" });
      }
    });
    return () => sub.remove();
  }, [stop, traceName]);

  return {
    start,
    stop,
    isActive: () => perfService.isTraceActive(traceName),
  };
}
