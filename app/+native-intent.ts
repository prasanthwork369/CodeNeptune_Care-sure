/** Maps incoming web/deep-link product paths (/{productType}/{slug}/{id}) into the app's route format (/product/{id}). */

// Allowed product-type path prefixes for rewrites
const PRODUCT_TYPE_SLUGS = ["medicines", "otc", "fmcg"];

export function redirectSystemPath({
  path,
}: {
  path: string | null;
  initial: boolean;
}): string {
  // Fallback to original path on invalid inputs to prevent launch crashes
  if (!path || typeof path !== "string") return path ?? "/";

  try {
    // Extract path + query from full URL
    let pathname = path;
    const schemeMatch = path.match(/^[a-z][a-z0-9+.-]*:\/\/[^/]*(\/.*)$/i);
    if (schemeMatch) pathname = schemeMatch[1];

    // Map /{productType}/{slug}/{id} -> /product/{id}
    const m = pathname.match(/^\/([^/]+)\/([^/]+)\/([^/?#]+)(?:[/?#].*)?$/);
    if (m && PRODUCT_TYPE_SLUGS.includes(m[1].toLowerCase())) {
      const id = decodeURIComponent(m[3]);
      return `/product/${encodeURIComponent(id)}`;
    }
  } catch {
    // Fallback on parsing failure
  }

  return path;
}
