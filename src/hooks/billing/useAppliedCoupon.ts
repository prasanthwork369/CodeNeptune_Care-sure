import { useCoupons } from "@/src/features/cart/hooks/useCoupons";
import { COUPON_DISCOUNT_TYPE } from "@/src/features/cart/constants/coupon";
import { useCouponStore } from "@/src/store/couponStore";
import { useEffect, useMemo } from "react";

export function useAppliedCoupon(subtotal: number) {
  const appliedCoupon = useCouponStore((s) => s.applied);
  const removeCoupon = useCouponStore((s) => s.remove);
  const { data: coupons = [] } = useCoupons();

  // Recomputed live from the coupon's own rule (not the frozen apply-time amount),
  // so it tracks price/quantity changes in either direction.
  const appliedCouponDef = useMemo(
    () =>
      appliedCoupon
        ? coupons.find((c) => c.code === appliedCoupon.code) ?? null
        : null,
    [appliedCoupon, coupons],
  );

  const couponStillEligible =
    !appliedCouponDef || subtotal >= appliedCouponDef.minOrderValue;

  useEffect(() => {
    if (appliedCoupon && appliedCouponDef && !couponStillEligible) {
      removeCoupon();
    }
  }, [appliedCoupon, appliedCouponDef, couponStillEligible, removeCoupon]);

  const couponDiscount = useMemo(() => {
    if (!appliedCoupon || !couponStillEligible) return 0;
    if (appliedCouponDef) {
      if (appliedCouponDef.discountType === COUPON_DISCOUNT_TYPE.PERCENTAGE) {
        const rawDiscount = (subtotal * appliedCouponDef.discountValue) / 100;
        return Math.min(
          appliedCouponDef.maxDiscountAmount
            ? Math.min(rawDiscount, appliedCouponDef.maxDiscountAmount)
            : rawDiscount,
          subtotal,
        );
      }
      return Math.min(appliedCouponDef.discountValue, subtotal);
    }
    return Math.min(Number(appliedCoupon.discount) || 0, subtotal);
  }, [appliedCoupon, appliedCouponDef, couponStillEligible, subtotal]);

  return {
    appliedCoupon,
    appliedCouponDef,
    couponDiscount,
    couponStillEligible,
    removeCoupon,
  };
}
