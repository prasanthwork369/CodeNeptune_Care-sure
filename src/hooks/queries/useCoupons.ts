import { useQuery } from "@tanstack/react-query";
import { couponService } from "../../services/coupon.service";
import { QUERY_KEYS } from "@/src/lib/react-query/queryKeys";
import { useAuthStore } from "../../store/authStore";

export const useCoupons = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: QUERY_KEYS.CUSTOMER.COUPONS,
    queryFn: couponService.getActiveCoupons,
    enabled: isAuthenticated,
    staleTime: 0,
    refetchOnMount: true,
  });
};
