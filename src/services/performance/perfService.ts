import { isExpoGo } from "../../utils/environment";
import { PerfTraceName, TraceAttributes, TraceMetrics } from "./types";

/**
 * Lazy-loads `@react-native-firebase/perf` to avoid native module lookup errors
 * when running in non-native environments (Expo Go, Web, or Jest test runners).
 */
const getPerf = () => {
  if (isExpoGo) return null;
  try {
    return require("@react-native-firebase/perf").default;
  } catch {
    return null;
  }
};

class PerformanceService {
  private activeTraces = new Map<string, any>();
  // Dev-only wall-clock timers so trace durations print to the console instantly
  // during development — Firebase's own data only surfaces in the console hours
  // later, and not at all in Expo Go. Independent of the native perf module.
  private devTimers = new Map<string, number>();

  /**
   * Starts a custom performance trace with optional initial attributes and metrics.
   * Prevents duplicate trace initialization for the same trace name.
   */
  async startTrace(
    traceName: PerfTraceName,
    attributes?: TraceAttributes,
    metrics?: TraceMetrics
  ): Promise<void> {
    if (__DEV__ && !this.devTimers.has(traceName)) {
      this.devTimers.set(traceName, Date.now());
    }

    const perf = getPerf();
    if (!perf) return;

    try {
      if (this.activeTraces.has(traceName)) {
        return; // Guard against duplicate trace starts
      }

      const trace = await perf().newTrace(traceName);

      // Attach custom attributes if provided
      if (attributes) {
        Object.entries(attributes).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            trace.putAttribute(key, String(value));
          }
        });
      }

      // Attach custom metrics if provided
      if (metrics) {
        Object.entries(metrics).forEach(([key, value]) => {
          if (typeof value === "number" && !Number.isNaN(value)) {
            trace.putMetric(key, value);
          }
        });
      }

      await trace.start();
      this.activeTraces.set(traceName, trace);
    } catch (err) {
      if (__DEV__) console.warn(`[PerfService] Start trace error (${traceName}):`, err);
    }
  }

  /**
   * Stops an active custom trace, optionally adds final metrics/attributes, and flushes to Firebase.
   * Ensures the internal Map entry is cleared to prevent memory leaks.
   */
  async stopTrace(
    traceName: PerfTraceName,
    additionalAttributes?: TraceAttributes,
    additionalMetrics?: TraceMetrics
  ): Promise<void> {
    if (__DEV__) {
      const startedAt = this.devTimers.get(traceName);
      if (startedAt !== undefined) {
        const attrs = additionalAttributes ? ` ${JSON.stringify(additionalAttributes)}` : "";
        console.log(`[Perf] ${traceName}: ${Date.now() - startedAt}ms${attrs}`);
        this.devTimers.delete(traceName);
      }
    }

    const trace = this.activeTraces.get(traceName);
    if (!trace) return;

    try {
      if (additionalAttributes) {
        Object.entries(additionalAttributes).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            trace.putAttribute(key, String(value));
          }
        });
      }

      if (additionalMetrics) {
        Object.entries(additionalMetrics).forEach(([key, value]) => {
          if (typeof value === "number" && !Number.isNaN(value)) {
            trace.putMetric(key, value);
          }
        });
      }

      await trace.stop();
    } catch (err) {
      if (__DEV__) console.warn(`[PerfService] Stop trace error (${traceName}):`, err);
    } finally {
      this.activeTraces.delete(traceName); // Prevent memory leaks
    }
  }

  /**
   * Returns whether a specific trace is currently running.
   */
  isTraceActive(traceName: PerfTraceName): boolean {
    return this.activeTraces.has(traceName);
  }

  /**
   * Helper to track manual network requests if needed alongside automatic OkHttp interception.
   */
  async startHttpMetric(url: string, method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH") {
    const perf = getPerf();
    if (!perf) return null;
    try {
      const metric = await perf().newHttpMetric(url, method);
      await metric.start();
      return metric;
    } catch (err) {
      if (__DEV__) console.warn(`[PerfService] Start HTTP metric error (${url}):`, err);
      return null;
    }
  }
}

export const perfService = new PerformanceService();
