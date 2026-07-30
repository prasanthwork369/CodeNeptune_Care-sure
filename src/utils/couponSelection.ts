import { COUPON_DISCOUNT_TYPE } from "@/src/constants/coupon";
import { Coupon } from "@/src/types/cart";

export type CartCouponPick = {
  coupon: Coupon;
  savings: number;
  isLocked: boolean;
  remaining: number;
};

// Percentage coupons cap at maxDiscountAmount; flat coupons always give their face value.
export const computeCouponDiscount = (coupon: Coupon, amount: number) => {
  if (coupon.discountType === COUPON_DISCOUNT_TYPE.PERCENTAGE) {
    const raw = (amount * coupon.discountValue) / 100;
    return coupon.maxDiscountAmount
      ? Math.min(raw, coupon.maxDiscountAmount)
      : raw;
  }
  return coupon.discountValue;
};

// Picks the coupon worth showing on the cart for this exact subtotal.
// Scoring each coupon at its own minOrderValue used to make the biggest locked coupon always win.
export const selectCartCoupon = (
  coupons: Coupon[],
  subtotal: number,
): CartCouponPick | null => {
  if (coupons.length === 0) return null;

  const unlocked = coupons.filter((c) => subtotal >= c.minOrderValue);

  if (unlocked.length > 0) {
    const best = unlocked.reduce((a, b) => {
      const aSavings = computeCouponDiscount(a, subtotal);
      const bSavings = computeCouponDiscount(b, subtotal);
      if (aSavings !== bSavings) return bSavings > aSavings ? b : a;
      // Prefer the lower threshold, then the lower code, so quantity edits never flicker the card.
      if (a.minOrderValue !== b.minOrderValue)
        return b.minOrderValue < a.minOrderValue ? b : a;
      return a.code <= b.code ? a : b;
    });

    return {
      coupon: best,
      savings: computeCouponDiscount(best, subtotal),
      isLocked: false,
      remaining: 0,
    };
  }

  // Nothing is usable yet, so surface the closest threshold instead of the largest discount.
  const nearest = coupons.reduce((a, b) => {
    const aGap = a.minOrderValue - subtotal;
    const bGap = b.minOrderValue - subtotal;
    if (aGap !== bGap) return bGap < aGap ? b : a;
    const aSavings = computeCouponDiscount(a, a.minOrderValue);
    const bSavings = computeCouponDiscount(b, b.minOrderValue);
    if (aSavings !== bSavings) return bSavings > aSavings ? b : a;
    return a.code <= b.code ? a : b;
  });

  return {
    coupon: nearest,
    // Locked coupons advertise what the customer gets once they reach the threshold.
    savings: computeCouponDiscount(nearest, nearest.minOrderValue),
    isLocked: true,
    remaining: nearest.minOrderValue - subtotal,
  };
};
