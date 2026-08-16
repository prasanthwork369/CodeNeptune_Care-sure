import type { CartItem } from "@/src/features/cart/types";

/**
 * The business-relevant subset of a cart line, frozen at checkout "Proceed"
 * time so a stale bill can never be submitted alongside cart items that
 * changed after it was calculated. Deliberately excludes display-only
 * fields (name, image, brand, pack label) — only what pricing/prescription
 * gating actually depends on.
 */
export interface CartSnapshotLine {
  medicineId: string;
  productId: string | null;
  variantId: string | null;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  requiresPrescription: boolean;
}

export const buildCartSnapshot = (items: CartItem[]): CartSnapshotLine[] =>
  items.map((item) => ({
    medicineId: item.medicineId,
    productId: item.productId ?? item.metadata?.productId ?? null,
    variantId: item.metadata?.selectedVariantId ?? null,
    quantity: item.quantity,
    unitPrice: Number(item.unitPrice),
    discountPercent: Number(
      item.discountPercent ?? item.metadata?.discountPercent ?? 0,
    ),
    requiresPrescription: item.requiresPrescription,
  }));

// Sub-paisa float/string-formatting noise shouldn't count as a real change.
const PRICE_EPSILON = 0.01;

/**
 * True only if the live cart still matches the snapshot on every
 * business-relevant field — same lines, same quantities, same prices, same
 * discounts, same Rx flags. Used to refuse submitting a frozen bill against
 * cart items that changed since checkout began.
 *
 * Matches lines by `medicineId` only (not `productId`/`variantId`): this
 * app's cart already guarantees one medicine/variant maps to exactly one
 * `medicineId` (variants get their own UUID), so medicineId alone fully
 * identifies a line. `productId` can legitimately lag as a backend
 * enrichment field independent of any real change, so comparing it here
 * would risk a false "changed" block on an untouched cart.
 */
export const cartMatchesSnapshot = (
  current: CartItem[],
  snapshot: CartSnapshotLine[],
): boolean => {
  if (current.length !== snapshot.length) return false;

  return snapshot.every((line) => {
    const match = current.find((item) => item.medicineId === line.medicineId);
    if (!match) return false;

    const matchUnitPrice = Number(match.unitPrice);
    const matchDiscountPercent = Number(
      match.discountPercent ?? match.metadata?.discountPercent ?? 0,
    );

    return (
      match.quantity === line.quantity &&
      Math.abs(matchUnitPrice - line.unitPrice) < PRICE_EPSILON &&
      Math.abs(matchDiscountPercent - line.discountPercent) < PRICE_EPSILON &&
      match.requiresPrescription === line.requiresPrescription
    );
  });
};
