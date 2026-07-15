import { couponService } from "@/src/services/coupon.service";
import { Coupon } from "@/src/types/cart";
import { useEffect, useState } from "react";

// Pre-validates every coupon on load (one call each) so coupons the customer
// can't actually use — e.g. usage limit reached on a past order — can be shown
// inactive before they tap Apply. Returns the set of codes that failed.
export function useCouponAvailability(coupons: Coupon[], subtotal: number) {
  const [unavailable, setUnavailable] = useState<Set<string>>(new Set());
  const [checkedKey, setCheckedKey] = useState<string | null>(null);

  // Identifies which coupons+subtotal the current result belongs to.
  const key = `${coupons.map((c) => c.code).join(",")}|${subtotal}`;

  // Derived during render, so the list never flashes as available before the check.
  const checking = coupons.length > 0 && checkedKey !== key;

  useEffect(() => {
    if (coupons.length === 0) {
      setUnavailable(new Set());
      setCheckedKey(key);
      return;
    }

    let cancelled = false;

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
      setCheckedKey(key);
    });

    return () => {
      cancelled = true;
    };
  }, [coupons, subtotal, key]);

  return { unavailable, checking };
}
