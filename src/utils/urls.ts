export const LIVE = false;

const PROD_URL = "https://care-sure-api-gateway.onrender.com";
const QA_URL = "https://qa-csapi.codeneptune.com";

export const API_BASE_URL = LIVE ? PROD_URL : QA_URL;
export const API_TIMEOUT = __DEV__ ? 60_000 : 15_000;

export const API_ENDPOINTS = {
  // ── Auth ─────────────────────────────────────────────────────────────────
  AUTH_REQUEST_OTP: "/api/v1/customers/auth/request-otp",
  AUTH_VERIFY_OTP: "/api/v1/customers/auth/verify-otp",
  AUTH_REFRESH: "/api/v1/customers/auth/refresh",
  AUTH_LOGOUT: "/api/v1/customers/auth/logout",

  // ── Customer ─────────────────────────────────────────────────────────────
  CUSTOMER_PROFILE: "/api/v1/customers/profile",
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
  PRESCRIPTION_ORDER_MEDICINES: (orderId: string) =>
    `/api/v1/prescriptions/order/${orderId}`,

  // ── Orders ───────────────────────────────────────────────────────────────
  ORDERS: "/api/v1/orders",
  ORDER_BY_ID: (id: string) => `/api/v1/orders/${id}`,
  ORDER_CANCEL: (id: string) => `/api/v1/orders/${id}/cancel`,

  // ── Wallet ───────────────────────────────────────────────────────────────
  WALLET_BALANCE: "/api/v1/customers/wallet/balance",
  WALLET_LOGS: "/api/v1/customers/wallet/logs",
  WALLET_TOPUP: "/api/v1/customers/wallet/topup",

  // ── Push Notifications ───────────────────────────────────────────────────
  PUSH_TOKEN: "/api/v1/customers/push-token",

  // ── Cart ─────────────────────────────────────────────────────────────────
  CART: "/api/v1/cart",
  CART_ITEMS: "/api/v1/cart/items",
  CART_ITEM_BY_ID: (itemId: string) => `/api/v1/cart/items/${itemId}`,
  CART_CHECKOUT: "/api/v1/cart/checkout",

  // ── Coupons ──────────────────────────────────────────────────────────────
  COUPONS_ACTIVE: "/api/v1/coupons/active",
  COUPONS_VALIDATE: "/api/v1/coupons/validate",

  // ── Settings ─────────────────────────────────────────────────────────────
  SETTINGS_MOBILE_APP_LINKS: "/api/v1/settings/mobile-app-links",
  SETTINGS_CART_WALLET: "/api/v1/settings/public/customer/cart-wallet",
};
