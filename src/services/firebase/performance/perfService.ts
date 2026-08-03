import { isExpoGo } from "../../../utils/environment";
import { PerfTraceName, TraceAttributes, TraceMetrics } from "./types";
// Type-only, so the native module is still lazy-required below.
import type { PerformanceTrace } from "@react-native-firebase/perf";
import { logger } from "@/src/utils/logger";

/**
 * Disable Performance Monitoring in Expo Go, Metro, and Development / Debug builds (__DEV__).
 * Performance traces & metric collection are ONLY enabled for production / release builds (!__DEV__).
 */
const isPerfDisabled = isExpoGo || __DEV__;

const getPerf = () => {
  if (isPerfDisabled) return null;
  try {
    return require("@react-native-firebase/perf").default;
  } catch {
    return null;
  }
};

// Explicitly toggle performance metric collection based on build environment
if (!isExpoGo) {
  try {
    const perf = require("@react-native-firebase/perf").default;
    perf().setPerformanceCollectionEnabled(!isPerfDisabled);
  } catch {
    // Ignore in non-native / test environments
  }
}

class PerformanceService {
  private activeTraces = new Map<string, TraceSession>();
  // later, and not at all in Expo Go. Independent of the native perf module.
  private devTimers = new Map<string, number>();
  // Safety timers that force-stop a trace that outlives maxDurationMs, so a
  // trace whose stop is missed can't report minutes of idle/background time.
  private autoStopTimers = new Map<string, ReturnType<typeof setTimeout>>();

  private clearAutoStop(traceName: string) {
    const timer = this.autoStopTimers.get(traceName);
    if (timer) {
      clearTimeout(timer);
      this.autoStopTimers.delete(traceName);
    }
  }

  private async finishTrace(
    traceName: PerfTraceName,
    session: TraceSession,
    additionalAttributes?: TraceAttributes,
    additionalMetrics?: TraceMetrics,
  ) {
    if (session.stopping || !session.trace) return;
    session.stopping = true;
    // Captured once, so the callbacks below close over a stable non-null trace.
    const trace = session.trace;

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
      if (__DEV__)
        console.warn(`[PerfService] Stop trace error (${traceName}):`, err);
    } finally {
      if (this.activeTraces.get(traceName) === session) {
        this.activeTraces.delete(traceName);
      }
    }
  }

  /**
   * Starts a custom performance trace with optional initial attributes and metrics.
   * Prevents duplicate trace initialization for the same trace name.
   */
  async startTrace(
    traceName: PerfTraceName,
    attributes?: TraceAttributes,
    metrics?: TraceMetrics,
    maxDurationMs?: number,
  ): Promise<void> {
    // Reserve the name synchronously, before the async native trace creation.
    // Without this, two renders can both call newTrace(), and a stop that lands
    // before newTrace() resolves can leave the late trace running indefinitely.
    if (this.activeTraces.has(traceName)) return;
    const session: TraceSession = {
      trace: null,
      stopping: false,
      stopRequested: false,
    };
    this.activeTraces.set(traceName, session);

    if (__DEV__) this.devTimers.set(traceName, Date.now());

    // Bound the trace so a missed stop can't inflate the average. Fires once;
    // the recorded sample is tagged so it can be filtered out in the console.
    if (
      maxDurationMs &&
      maxDurationMs > 0 &&
      !this.autoStopTimers.has(traceName)
    ) {
      this.autoStopTimers.set(
        traceName,
        setTimeout(() => {
          this.autoStopTimers.delete(traceName);
          this.stopTrace(traceName, { timed_out: "true" });
        }, maxDurationMs),
      );
    }

    const perf = getPerf();
    if (!perf) return;

    try {
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
      session.trace = trace;

      // stopTrace may have been called while the native module was creating
      // this trace. Stop immediately in that case; never leave a late trace
      // measuring screen dwell/background time.
      if (session.stopRequested) {
        await this.finishTrace(
          traceName,
          session,
          session.stopAttributes,
          session.stopMetrics,
        );
      }
    } catch (err) {
      if (__DEV__)
        console.warn(`[PerfService] Start trace error (${traceName}):`, err);
      this.clearAutoStop(traceName);
      if (this.activeTraces.get(traceName) === session) {
        this.activeTraces.delete(traceName);
      }
    }
  }

  /**
   * Stops an active custom trace, optionally adds final metrics/attributes, and flushes to Firebase.
   * Ensures the internal Map entry is cleared to prevent memory leaks.
   */
  async stopTrace(
    traceName: PerfTraceName,
    additionalAttributes?: TraceAttributes,
    additionalMetrics?: TraceMetrics,
  ): Promise<void> {
    this.clearAutoStop(traceName);

    if (__DEV__) {
      const startedAt = this.devTimers.get(traceName);
      if (startedAt !== undefined) {
        const attrs = additionalAttributes
          ? ` ${JSON.stringify(additionalAttributes)}`
          : "";
        logger.debug(
          `[Perf] ${traceName}: ${Date.now() - startedAt}ms${attrs}`,
        );
        this.devTimers.delete(traceName);
      }
    }

    const session = this.activeTraces.get(traceName);
    if (!session || session.stopping) return;

    if (!session.trace) {
      // Keep the requested terminal data until asynchronous creation finishes.
      session.stopRequested = true;
      session.stopAttributes = additionalAttributes;
      session.stopMetrics = additionalMetrics;
      return;
    }

    await this.finishTrace(
      traceName,
      session,
      additionalAttributes,
      additionalMetrics,
    );
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
  async startHttpMetric(
    url: string,
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
  ) {
    const perf = getPerf();
    if (!perf) return null;
    try {
      const metric = await perf().newHttpMetric(url, method);
      await metric.start();
      return metric;
    } catch (err) {
      if (__DEV__)
        console.warn(`[PerfService] Start HTTP metric error (${url}):`, err);
      return null;
    }
  }
}

type TraceSession = {
  trace: PerformanceTrace | null;
  stopping: boolean;
  stopRequested: boolean;
  stopAttributes?: TraceAttributes;
  stopMetrics?: TraceMetrics;
};

export const perfService = new PerformanceService();
