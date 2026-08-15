import { API_ENDPOINTS } from "../utils/urls";
import { apiClient } from "./client";
import { Coupon, CouponValidationResult } from "../features/cart/types";

export const couponApi = {
  getActiveCoupons: async (): Promise<Coupon[]> => {
    const response = await apiClient.get(API_ENDPOINTS.COUPONS_ACTIVE);
    return response.data.data;
  },

  validateCoupon: async (
    code: string,
    subtotal: number,
  ): Promise<CouponValidationResult> => {
    const response = await apiClient.post(API_ENDPOINTS.COUPONS_VALIDATE, {
      code,
      subtotal,
    });
    return response.data.data;
  },
};
