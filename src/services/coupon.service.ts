import { couponApi } from "../api/coupon.api";

export const couponService = {
  getActiveCoupons: () => couponApi.getActiveCoupons(),
  validateCoupon: (code: string, subtotal: number) =>
    couponApi.validateCoupon(code, subtotal),
};
