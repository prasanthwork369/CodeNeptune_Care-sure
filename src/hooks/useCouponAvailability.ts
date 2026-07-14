import { couponService } from "@/src/services/coupon.service";
import { Coupon } from "@/src/types/cart";
import { useEffect, useState } from "react";

// Pre-validates every coupon on load (one call each) so coupons the customer
// can't actually use — e.g. usage limit reached on a past order — can be shown
// inactive before they tap Apply. Returns the set of codes that failed.
export function useCouponAvailability(coupons: Coupon[], subtotal: number) {
  const [unavailable, setUnavailable] = useState<Set<string>>(new Set());
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (coupons.length === 0) {
      setUnavailable(new Set());
      return;
    }

    let cancelled = false;
    setChecking(true);

    Promise.all(
      coupons.map(async (c) => {
        try {
          const res = await couponService.validateCoupon(c.code, subtotal);
          return { code: c.code, ok: res.valid };
        } catch {
          // A 4xx (e.g. limit reached) counts as unavailable.
          return { code: c.code, ok: false };
        }
      }),
    ).then((results) => {
      if (cancelled) return;
      setUnavailable(new Set(results.filter((r) => !r.ok).map((r) => r.code)));
      setChecking(false);
    });

    return () => {
      cancelled = true;
    };
  }, [coupons, subtotal]);

  return { unavailable, checking };
}
