import { useQuery } from "@tanstack/react-query";
import { couponApi } from "@/src/features/cart/api/coupon.api";
import { QUERY_KEYS } from "@/src/lib/react-query/queryKeys";
import { useAuthStore } from "../../store/authStore";

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
