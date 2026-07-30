import { couponService } from "@/src/services/coupon.service";
import { Coupon } from "@/src/types/cart";
import { useEffect, useRef, useState } from "react";

const EMPTY_SET = new Set<string>();

// Pre-validates every coupon on load (one call each) so coupons the customer
// can't actually use — e.g. usage limit reached on a past order — can be shown
// inactive before they tap Apply. Returns the set of codes that failed.
export function useCouponAvailability(coupons: Coupon[], subtotal: number) {
  const [unavailable, setUnavailable] = useState<Set<string>>(EMPTY_SET);
  const checkedKeyRef = useRef<string | null>(null);

  // Identifies which coupons+subtotal the current result belongs to.
  const key = `${coupons.map((c) => c.code).join(",")}|${subtotal}`;

  // Derived during render, so the list never flashes as available before the check.
  const checking = coupons.length > 0 && checkedKeyRef.current !== key;

  useEffect(() => {
    if (checkedKeyRef.current === key) return;

    if (coupons.length === 0) {
      checkedKeyRef.current = key;
      if (unavailable.size > 0) setUnavailable(EMPTY_SET);
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
      checkedKeyRef.current = key;
      setUnavailable(new Set(results.filter((r) => !r.ok).map((r) => r.code)));
    });

    return () => {
      cancelled = true;
    };
  }, [key, coupons, subtotal, unavailable.size]);

  return { unavailable, checking };
}
