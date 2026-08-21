import type { PrescriptionListParams } from "@/src/features/prescription/types";

interface OrderListParams {
  page?: number;
  limit?: number;
  status?: string;
  sortOrder?: "asc" | "desc";
}

interface ReturnListParams {
  page?: number;
  limit?: number;
  status?: string;
}

interface HealthProblemParams {
  page?: number;
  limit?: number;
  search?: string;
}

interface CancellationReasonParams {
  page?: number;
  limit?: number;
  type?: string;
}

export const QUERY_KEYS = {
  CUSTOMER: {
    PROFILE: ["customer", "profile"] as const,
    ADDRESSES: ["customer", "addresses"] as const,
    MEMBERS: ["customer", "members"] as const,
    CART: ["customer", "cart"] as const,
    COUPONS: ["customer", "coupons", "active"] as const,
    SUBSTITUTE_REQUESTS: ["customer", "substitute-requests"] as const,
    PRESCRIPTIONS: {
      LIST_ALL: ["customer", "prescriptions"] as const,
      LIST: (params?: PrescriptionListParams) =>
        ["customer", "prescriptions", "list", params] as const,
      BY_ID: (id: string) =>
        ["customer", "prescriptions", "detail", id] as const,
    },
    ORDERS: {
      // Invalidate with LIST_ALL, never LIST() -- a trailing `undefined` fails to prefix-match LIST({}).
      LIST_ALL: ["customer", "orders", "list"] as const,
      LIST: (params?: OrderListParams) =>
        ["customer", "orders", "list", params] as const,
      BY_ID: (id: string) => ["customer", "orders", "detail", id] as const,
    },
    RETURNS: {
      LIST_ALL: ["customer", "returns", "list"] as const,
      LIST: (params?: ReturnListParams) =>
        ["customer", "returns", "list", params] as const,
      BY_ID: (id: string) => ["customer", "returns", "detail", id] as const,
    },
    NOTIFICATIONS: ["customer", "notifications"] as const,
    NOTIFICATION_PREFERENCES: ["customer", "notification-preferences"] as const,
    WALLET: {
      BALANCE: ["customer", "wallet", "balance"] as const,
      LOGS: (params?: { limit?: number; offset?: number }) =>
        ["customer", "wallet", "logs", params] as const,
    },
  },
  CATALOG: {
    CATEGORY_MAP: ["catalog", "category-map"] as const,
    CATEGORY_PRODUCTS: (subCategoryId: string) =>
      ["catalog", "category-products", subCategoryId] as const,
    PRODUCT_BY_ID: (id: string) => ["catalog", "product", id] as const,
    FEATURED_MEDICINES: ["catalog", "featured-medicines"] as const,
    FEATURED_SUBCATEGORIES: ["catalog", "featured-subcategories"] as const,
    LAST_MINUTE_BUY: ["catalog", "last-minute-buy"] as const,
  },
  APP: {
    CONTENTS: ["app", "contents"] as const,
    HEALTH_PROBLEMS: (params?: HealthProblemParams) =>
      ["app", "health-problems", params] as const,
  },
  SEARCH: {
    MEDICINES: (query: string) => ["search", "medicines", query] as const,
    SUGGESTIONS: (query: string) => ["search", "suggestions", query] as const,
    HISTORY: (params?: { limit?: number; offset?: number }) =>
      ["search", "history", params] as const,
    TRENDING: (limit?: number) => ["search", "trending", limit] as const,
  },
  LOCATION: {
    AUTOCOMPLETE: (query: string) =>
      ["location", "autocomplete", query] as const,
  },
  CANCELLATION_REASONS: {
    LIST: (params?: CancellationReasonParams) =>
      ["cancellation-reasons", "list", params] as const,
  },
  SYSTEM_TEMPLATES: {
    BY_EVENT: (
      event: string,
      channel: string,
      variables?: Record<string, unknown>,
    ) => ["system-templates", "by-event", event, channel, variables] as const,
  },
} as const;
