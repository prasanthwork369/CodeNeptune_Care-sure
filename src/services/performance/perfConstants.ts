import { PerfTraceName } from "./types";

/**
 * Enterprise Single Source of Truth for Performance Trace Identifiers.
 * Do NOT hardcode trace strings anywhere else in the project.
 */
export const PERF_TRACES = {
  APP_LAUNCH: "app_launch" as PerfTraceName,
  HOME_SCREEN_LOAD: "home_screen_load" as PerfTraceName,
  PRODUCT_LIST_LOAD: "product_list_load" as PerfTraceName,
  PRODUCT_DETAILS_LOAD: "product_details_load" as PerfTraceName,
  SEARCH_QUERY_LOAD: "search_query_load" as PerfTraceName,
  CART_LOAD: "cart_load" as PerfTraceName,
  CHECKOUT_FLOW: "checkout_flow" as PerfTraceName,
  LOGIN_SUBMIT: "login_submit" as PerfTraceName,
} as const;
