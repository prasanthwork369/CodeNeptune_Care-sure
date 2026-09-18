import { parseMoney } from "@/src/utils/money";
import type { CartItem } from "../types";

export interface CartLinePricing {
  /** Payable price per unit. */
  price: number;
  /** Strikethrough price per unit; equals `price` when there is no discount. */
  mrp: number;
  discountPercent: number;
}

/**
 * Resolves a cart line's payable and strikethrough price.
 *
 * `unitPrice` is the selling price (order-service sums it for the subtotal),
 * and `mrpPrice` carries the strikethrough. Builds before that was fixed wrote
 * the MRP into both, so rows written by them are detected and their price is
 * derived instead — otherwise an old row would display at MRP and silently
 * lose its discount.
 */
export function resolveCartLinePricing(item: CartItem): CartLinePricing {
  const unitPrice = parseMoney(item.unitPrice);
  const discountPercent = Number(
    item.discountPercent ?? item.metadata?.discountPercent ?? 0,
  );
  const storedMrp = parseMoney(
    item.mrpPrice ?? item.originalPrice ?? item.metadata?.mrp ?? item.unitPrice,
  );

  // A discounted line can only have unitPrice >= mrp if unitPrice still holds
  // the MRP, which is exactly what the old write path produced.
  const isLegacyMrpRow = discountPercent > 0 && unitPrice >= storedMrp;

  if (isLegacyMrpRow) {
    const price = unitPrice * (1 - discountPercent / 100);
    return {
      price: Number(price.toFixed(2)),
      mrp: unitPrice,
      discountPercent,
    };
  }

  return {
    price: unitPrice,
    mrp: storedMrp > unitPrice ? storedMrp : unitPrice,
    discountPercent,
  };
}
