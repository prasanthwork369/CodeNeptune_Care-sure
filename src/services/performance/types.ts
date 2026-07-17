export type PerfTraceName =
  | "app_launch"
  | "home_screen_load"
  | "home_scroll"
  | "product_list_load"
  | "product_details_load"
  | "search_query_load"
  | "cart_load"
  | "checkout_flow"
  | "login_submit";

export interface TraceAttributes {
  [key: string]: string;
}

export interface TraceMetrics {
  [key: string]: number;
}

export interface UsePerformanceTraceOptions {
  /** Trace identifier constant from PERF_TRACES */
  traceName: PerfTraceName;
  /** Boolean indicating whether the target screen/data is currently loading. Trace stops when this becomes false. */
  isLoading?: boolean;
  /** Custom string attributes to attach to the trace */
  attributes?: TraceAttributes;
  /** Custom numeric metrics to attach to the trace */
  metrics?: TraceMetrics;
  /** If true, the trace will not auto-start on mount (requires manual trigger) */
  manualStart?: boolean;
}
