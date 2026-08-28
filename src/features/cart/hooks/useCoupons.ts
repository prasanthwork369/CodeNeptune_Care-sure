import { useQuery } from "@tanstack/react-query";
import { couponApi } from "@/src/features/cart/api/coupon.api";
import { QUERY_KEYS } from "@/src/lib/react-query/queryKeys";
import { useAuthStore } from "@/src/store/authStore";
import type { Coupon } from "@/src/features/cart/types";
import { useMemo } from "react";

export const useCoupons = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: QUERY_KEYS.CUSTOMER.COUPONS,
    queryFn: couponApi.getActiveCoupons,
    enabled: isAuthenticated,
    staleTime: 0,
    refetchOnMount: true,
  });
};

/**
 * Derives the set of unavailable coupon codes from the coupon payload synchronously.
 */
export function useCouponAvailability(coupons: Coupon[]): Set<string> {
  return useMemo(
    () => new Set(coupons.filter((c) => c.isUsedUp).map((c) => c.code)),
    [coupons],
  );
}

/**
 * Filters coupons locally by matching the search query against coupon codes.
 */
export function useCouponSearch(coupons: Coupon[], query: string): Coupon[] {
  return useMemo(() => {
    const q = query.trim().toUpperCase();
    if (!q) return coupons;
    return coupons.filter((c) => c.code?.toUpperCase().includes(q));
  }, [coupons, query]);
}
