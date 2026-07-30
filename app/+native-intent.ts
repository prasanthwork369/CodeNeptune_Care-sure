/**
 * Reconciles inbound web/deep-link URLs with the app's route tree.
 *
 * The web serves product pages at /{productType}/{slug}/{id} (three segments),
 * but the app's only product route is /product/[id]. Without this rewrite an
 * opened web link — https://.../fmcg/herbal-.../CS-0173 — has no matching route
 * and Expo Router 404s. Here we pull the trailing id (the source of truth; the
 * product is fetched by id, slug is cosmetic) and send it to /product/[id].
 *
 * Everything else passes through untouched, so existing caresure://… links and
 * every other route behave exactly as before.
 */

// The web's valid product-type slugs. A path only rewrites if its first segment
// is one of these — so /categories/…, /orders/… etc. are never misread as products.
const PRODUCT_TYPE_SLUGS = ["medicines", "otc", "fmcg"];

export function redirectSystemPath({
  path,
}: {
  path: string | null;
  initial: boolean;
}): string {
  // path can be null (cold start with no URL). Treat anything unexpected as
  // "no rewrite" and return it verbatim — a throw here would crash app launch.
  if (!path || typeof path !== "string") return path ?? "/";

  try {
    // Strip scheme/host if a full URL arrives; keep just the path + query.
    let pathname = path;
    const schemeMatch = path.match(/^[a-z][a-z0-9+.-]*:\/\/[^/]*(\/.*)$/i);
    if (schemeMatch) pathname = schemeMatch[1];

    // /{productType}/{slug}/{id}  ->  /product/{id}
    // Segments are matched loosely but the id is required and passed through
    // encoded, so a crafted slug can't inject extra path segments.
    const m = pathname.match(/^\/([^/]+)\/([^/]+)\/([^/?#]+)(?:[/?#].*)?$/);
    if (m && PRODUCT_TYPE_SLUGS.includes(m[1].toLowerCase())) {
      const id = decodeURIComponent(m[3]);
      return `/product/${encodeURIComponent(id)}`;
    }
  } catch {
    // Any parsing failure -> fall through to the original path unchanged.
  }

  return path;
}
