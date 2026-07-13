/**
 * @module constants/urls
 * Centralised URL constants for the app.
 * Update these when switching between environments (dev / qa / prod).
 */

/** Base URL for the CareSure web store / landing pages */
export const WEB_BASE_URL = "https://qa-caresure.codeneptune.com";

/** Custom deep-link scheme registered in app.config.ts */
export const APP_SCHEME = "caresure";

// ─── Builders ──────────────────────────────────────────────────────────────

/**
 * Returns the canonical web URL for a product page.
 * e.g. https://qa-caresure.codeneptune.com/product/abc-123
 */
export const productWebUrl = (productId: string) =>
  `${WEB_BASE_URL}/product/${productId}`;

/**
 * Returns the app deep-link URL for a product page.
 * e.g. caresure://product/abc-123
 */
export const productAppUrl = (productId: string) =>
  `${APP_SCHEME}://product/${productId}`;
