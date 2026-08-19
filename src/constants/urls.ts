/** Centralized URL constants and builders for the app. */

// Web store base URL imported from central utility
import { WEB_BASE_URL } from "@/src/utils/urls";
import { PRODUCT_TYPE } from "./product-type";
export { WEB_BASE_URL };

/** Custom deep-link scheme */
export const APP_SCHEME = "caresure";

// Map product type ID to web URL path slug
const PRODUCT_TYPE_SLUG: Record<number, string> = {
  [PRODUCT_TYPE.MEDICINE]: "medicines",
  [PRODUCT_TYPE.OTC]: "otc",
  [PRODUCT_TYPE.FMCG]: "fmcg",
};

// ─── Builders ──────────────────────────────────────────────────────────────

/** Generates product page web URL (format: /typeSlug/slug/productId) */
export const productWebUrl = (
  productId: string,
  productType?: number,
  slug?: string,
) => {
  const typeSlug =
    (productType != null && PRODUCT_TYPE_SLUG[productType]) || "medicines";
  return `${WEB_BASE_URL}/${typeSlug}/${slug || "item"}/${productId}`;
};

/** Generates product page deep-link URL (format: caresure://product/productId) */
export const productAppUrl = (productId: string) =>
  `${APP_SCHEME}://product/${productId}`;
