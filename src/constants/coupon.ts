/**
 * Coupon Status constants for the customer website.
 * Matches backend numeric status codes: 0 (Deleted), 1 (Active), 2 (Inactive)
 */
export const COUPON_STATUS = {
  DELETED: 0,
  ACTIVE: 1,
  INACTIVE: 2,
} as const;

export type CouponStatusValue = typeof COUPON_STATUS[keyof typeof COUPON_STATUS];

export const COUPON_STATUS_LABELS: Record<CouponStatusValue, string> = {
  [COUPON_STATUS.DELETED]: 'Deleted',
  [COUPON_STATUS.ACTIVE]: 'Active',
  [COUPON_STATUS.INACTIVE]: 'Inactive',
};

/**
 * Coupon Discount Type constants for the customer website.
 * Matches backend numeric discount type codes: 1 (Flat), 2 (Percentage)
 */
export const COUPON_DISCOUNT_TYPE = {
  FLAT: 1,
  PERCENTAGE: 2,
} as const;

export type CouponDiscountTypeValue = typeof COUPON_DISCOUNT_TYPE[keyof typeof COUPON_DISCOUNT_TYPE];

export const COUPON_DISCOUNT_TYPE_LABELS: Record<CouponDiscountTypeValue, string> = {
  [COUPON_DISCOUNT_TYPE.FLAT]: 'Flat',
  [COUPON_DISCOUNT_TYPE.PERCENTAGE]: 'Percentage',
};
