import { COUPON_DISCOUNT_TYPE } from "@/src/constants/coupon";
import { Coupon } from "@/src/features/cart/types";

// Shared by the coupons screen and the cart card so the two can never word the same coupon differently.
export const formatCouponTerms = (coupon: Coupon) => {
  if (coupon.discountType === COUPON_DISCOUNT_TYPE.PERCENTAGE) {
    const cap = coupon.maxDiscountAmount
      ? `, max ₹${coupon.maxDiscountAmount}`
      : "";
    return `${coupon.discountValue}% off on orders above ₹${coupon.minOrderValue}${cap}`;
  }
  return `Flat ₹${coupon.discountValue} off on orders above ₹${coupon.minOrderValue}`;
};

// Returns null for a missing or unparseable date so callers render nothing instead of "Invalid Date".
export const formatCouponExpiry = (iso?: string | null) => {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
