import { Coupon } from "@/src/types/cart";
import { useMemo } from "react";

// Availability ships with the coupons payload as `isUsedUp`, matching the web
// CouponDrawer. Deriving it here keeps it synchronous, so the list paints once
// with its final state instead of repainting after a validate call per coupon.
export function useCouponAvailability(coupons: Coupon[]) {
  return useMemo(
    () => new Set(coupons.filter((c) => c.isUsedUp).map((c) => c.code)),
    [coupons],
  );
}
