import { Coupon } from "@/src/types/cart";
import { useMemo } from "react";

// Filters the coupon list locally by the code typed in the search box.
export function useCouponSearch(coupons: Coupon[], query: string) {
  return useMemo(() => {
    const q = query.trim().toUpperCase();
    if (!q) return coupons;
    return coupons.filter((c) => c.code?.toUpperCase().includes(q));
  }, [coupons, query]);
}
