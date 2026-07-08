// Backend URLs live in .env.local (gitignored), not in source -- see .env.example.
// Flip LIVE to switch the app between the live API and QA.
const LIVE = false;
const PROD_URL = process.env.EXPO_PUBLIC_API_BASE_URL_PROD;
const QA_URL = process.env.EXPO_PUBLIC_API_BASE_URL_QA;

const resolvedBaseUrl = LIVE ? PROD_URL : QA_URL;

if (!resolvedBaseUrl) {
  throw new Error(
    "Missing API base URL: set EXPO_PUBLIC_API_BASE_URL_PROD and EXPO_PUBLIC_API_BASE_URL_QA in .env.local (see .env.example).",
  );
}

export const API_BASE_URL = resolvedBaseUrl;
export const API_TIMEOUT = __DEV__ ? 60_000 : 15_000;

/** Prefixes a relative backend path (e.g. "/uploads/icon.png") with the API base URL. */
export const resolveAssetUrl = (path: string) =>
  path.startsWith("http") ? path : `${API_BASE_URL}${path}`;

export const API_ENDPOINTS = {
  // ── Catalog ──────────────────────────────────────────────────────────────
  CATALOG_CATEGORIES_MAP: "/api/v1/catalog/categories/map",
  CATALOG_PRODUCTS: "/api/v1/catalog/products",
  CATALOG_FEATURED: "/api/v1/catalog/medicines/featured",
  CATALOG_FEATURED_SUBCATEGORIES: "/api/v1/catalog/subcategories/featured",
  HEALTH_PROBLEMS: "/api/v1/health-problems",

  // ── Auth ─────────────────────────────────────────────────────────────────
  AUTH_REQUEST_OTP: "/api/v1/customers/auth/request-otp",
  AUTH_VERIFY_OTP: "/api/v1/customers/auth/verify-otp",
  AUTH_REFRESH: "/api/v1/customers/auth/refresh",
  AUTH_LOGOUT: "/api/v1/customers/auth/logout",

  // ── Customer ─────────────────────────────────────────────────────────────
  // Account deletion is a DELETE on this same profile endpoint.
  CUSTOMER_PROFILE: "/api/v1/customers/profile",
  // Email verification: request sends an OTP to the given email, verify
  // confirms the OTP. Both are scoped to the logged-in customer (Bearer auth).
  CUSTOMER_EMAIL_REQUEST_VERIFY:
    "/api/v1/customers/profile/email/request-verify",
  CUSTOMER_EMAIL_VERIFY: "/api/v1/customers/profile/email/verify",
  CUSTOMER_NOTIFICATION_PREFERENCES:
    "/api/v1/customers/notification-preferences",
  CUSTOMER_ADDRESSES: "/api/v1/customers/addresses",
  CUSTOMER_ADDRESS_BY_ID: (id: string) => `/api/v1/customers/addresses/${id}`,
  STORAGE_UPLOAD: "/api/v1/customers/storage/upload",
  APP_CONTENTS: "/api/v1/app-contents",

  // ── Category ─────────────────────────────────────────────────────────────
  CATEGORY_FAMILY_MAP: "/api/v1/category-family/map",
  CATEGORY_FEATURED_SUBCATEGORIES:
    "/api/v1/category-family/featured-subcategories",
  CATEGORY_PRODUCTS: (categorySlug: string) =>
    `/api/v1/category-family/${categorySlug}/products`,

  // ── Medicines ────────────────────────────────────────────────────────────
  MEDICINES_FEATURED_CARDS: "/api/v1/medicines/featured/cards",

  // ── Search ───────────────────────────────────────────────────────────────
  SEARCH_MEDICINES: "/api/v1/search/medicines",
  SEARCH_SUGGESTIONS: "/api/v1/search/suggestions",
  PRODUCT_BY_ID: (productId: string) => `/api/v1/search/products/${productId}`,
  SEARCH_HISTORY: "/api/v1/customers/search-history",
  SEARCH_HISTORY_ITEM: (id: string) => `/api/v1/customers/search-history/${id}`,
  SEARCH_TRENDING: "/api/v1/customers/search-history/trending",

  // ── Family Members ───────────────────────────────────────────────────────
  FAMILY_MEMBERS: "/api/v1/family-members",
  FAMILY_MEMBER_BY_ID: (id: string) => `/api/v1/family-members/${id}`,

  // ── Prescriptions ────────────────────────────────────────────────────────
  PRESCRIPTIONS: "/api/v1/prescriptions",
  PRESCRIPTION_BY_ID: (id: string) => `/api/v1/prescriptions/${id}`,
  PRESCRIPTION_DISMISS: (id: string) => `/api/v1/prescriptions/${id}/dismiss`,
  PRESCRIPTION_ORDER_MEDICINES: (orderId: string) =>
    `/api/v1/prescriptions/order/${orderId}`,

  // ── Orders ───────────────────────────────────────────────────────────────
  ORDERS: "/api/v1/orders",
  ORDER_BY_ID: (id: string) => `/api/v1/orders/${id}`,
  ORDER_CANCEL: (id: string) => `/api/v1/orders/${id}/cancel`,

  // ── Returns ──────────────────────────────────────────────────────────────
  RETURNS: "/api/v1/returns",
  RETURN_BY_ID: (id: string) => `/api/v1/returns/${id}`,

  // ── Wallet ───────────────────────────────────────────────────────────────
  WALLET_BALANCE: "/api/v1/customers/wallet/balance",
  WALLET_LOGS: "/api/v1/customers/wallet/logs",
  WALLET_TOPUP: "/api/v1/customers/wallet/topup",

  // ── Push Notifications ───────────────────────────────────────────────────
  PUSH_DEVICE_REGISTER: "/api/v1/push-notifications/devices",
  PUSH_DEVICE_CLAIM: "/api/v1/push-notifications/devices/claim",
  PUSH_DEVICE_BY_TOKEN: (token: string) =>
    `/api/v1/push-notifications/devices/${encodeURIComponent(token)}`,

  // ── In-App Notifications ─────────────────────────────────────────────────
  NOTIFICATIONS: "/api/v1/customers/notifications",
  NOTIFICATION_MARK_READ: (id: string) =>
    `/api/v1/customers/notifications/${id}/read`,
  NOTIFICATION_DISMISS: (id: string) =>
    `/api/v1/customers/notifications/${id}/dismiss`,
  NOTIFICATIONS_DISMISS_ALL: "/api/v1/customers/notifications/dismiss-all",

  // ── Cart ─────────────────────────────────────────────────────────────────
  CART: "/api/v1/cart",
  CART_ITEMS: "/api/v1/cart/items",
  CART_ITEM_BY_ID: (itemId: string) => `/api/v1/cart/items/${itemId}`,
  CART_CHECKOUT: "/api/v1/cart/checkout",

  // ── Coupons ──────────────────────────────────────────────────────────────
  COUPONS_ACTIVE: "/api/v1/coupons/active",
  COUPONS_VALIDATE: "/api/v1/coupons/validate",

  // ── Cancellation Reasons ─────────────────────────────────────────────────
  CANCELLATION_REASONS: "/api/v1/reasons/cancellation-reasons",

  // ── Pincodes ─────────────────────────────────────────────────────────────
  PINCODE_CHECK: (pincode: string) => `/api/v1/pincodes/check/${pincode}`,

  // ── Settings ─────────────────────────────────────────────────────────────
  SETTINGS_MOBILE_APP_LINKS: "/api/v1/settings/mobile-app-links",
  SETTINGS_CART_WALLET: "/api/v1/settings/public/customer/cart-wallet",
  SETTINGS_PAYMENT: "/api/v1/settings/public/customer/payment-settings",

  // ── Sync ─────────────────────────────────────────────────────────────────
  SYNC_CHECK: "/api/v1/sync/check",
};
