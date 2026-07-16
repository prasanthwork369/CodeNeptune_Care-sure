/**
 * @module constants/urls
 * Centralised URL constants for the app.
 * Update these when switching between environments (dev / qa / prod).
 */

// Web store origin, resolved from the LIVE flag / env in one place so QA and
// prod can't diverge. Imported for local use below and re-exported to keep the
// existing "@/src/constants/urls" import path stable.
import { WEB_BASE_URL } from "@/src/utils/urls";
export { WEB_BASE_URL };

/** Custom deep-link scheme registered in app.config.ts */
export const APP_SCHEME = "caresure";

// The web PDP route is /[productType]/[slug]/[id], and productType must be one
// of these exact slugs or the page 404s. Mirrors the web's PRODUCT_TYPE_CONFIG
// (1=Medicine, 2=OTC, 3=FMCG). Unknown/absent type falls back to "medicines"
// like the web's own getProductUrl helper.
const PRODUCT_TYPE_SLUG: Record<number, string> = {
  1: "medicines",
  2: "otc",
  3: "fmcg",
};

// ─── Builders ──────────────────────────────────────────────────────────────

/**
 * Canonical web URL for a product, matching the web PDP route exactly:
 *   https://.../fmcg/herbal-zinc-defense-lozenge-pack/CS-0173
 *
 * The old /product/{id} shape does NOT exist on the web and 404s when shared —
 * the web only serves /{productType}/{slug}/{id}. The slug is cosmetic there
 * (the page fetches by id), so a missing slug still resolves.
 */
export const productWebUrl = (
  productId: string,
  productType?: number,
  slug?: string,
) => {
  const typeSlug =
    (productType != null && PRODUCT_TYPE_SLUG[productType]) || "medicines";
  return `${WEB_BASE_URL}/${typeSlug}/${slug || "item"}/${productId}`;
};

/**
 * Returns the app deep-link URL for a product page.
 * e.g. caresure://product/abc-123
 */
export const productAppUrl = (productId: string) =>
  `${APP_SCHEME}://product/${productId}`;
