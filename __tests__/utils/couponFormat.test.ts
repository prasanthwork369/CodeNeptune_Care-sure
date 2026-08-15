import { COUPON_DISCOUNT_TYPE } from "@/src/features/cart/constants/coupon";
import { Coupon } from "@/src/features/cart/types";
import {
  formatCouponExpiry,
  formatCouponTerms,
} from "@/src/features/cart/utils/couponFormat";

const coupon = (over: Partial<Coupon> & { code: string }): Coupon => ({
  id: over.code,
  discountType: COUPON_DISCOUNT_TYPE.FLAT,
  discountValue: 0,
  maxDiscountAmount: null,
  minOrderValue: 0,
  maxUses: null,
  maxUsesPerCustomer: 1,
  startsAt: "2026-01-01T00:00:00Z",
  expiresAt: "2027-01-01T00:00:00Z",
  status: 1,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  ...over,
});

describe("formatCouponTerms", () => {
  it("describes a flat coupon", () => {
    expect(
      formatCouponTerms(
        coupon({ code: "FLAT50", discountValue: 50, minOrderValue: 300 }),
      ),
    ).toBe("Flat ₹50 off on orders above ₹300");
  });

  it("describes a percentage coupon with its cap", () => {
    expect(
      formatCouponTerms(
        coupon({
          code: "PCT20",
          discountType: COUPON_DISCOUNT_TYPE.PERCENTAGE,
          discountValue: 20,
          minOrderValue: 200,
          maxDiscountAmount: 100,
        }),
      ),
    ).toBe("20% off on orders above ₹200, max ₹100");
  });

  it("omits the cap when the percentage coupon is uncapped", () => {
    expect(
      formatCouponTerms(
        coupon({
          code: "PCT10",
          discountType: COUPON_DISCOUNT_TYPE.PERCENTAGE,
          discountValue: 10,
          minOrderValue: 500,
        }),
      ),
    ).toBe("10% off on orders above ₹500");
  });
});

describe("formatCouponExpiry", () => {
  it("formats a valid date", () => {
    expect(formatCouponExpiry("2026-08-12T00:00:00Z")).toMatch(/Aug/);
  });

  // Guards against rendering "Expires Invalid Date" when the API omits the field.
  it("returns null for missing or unparseable dates", () => {
    expect(formatCouponExpiry(undefined)).toBeNull();
    expect(formatCouponExpiry(null)).toBeNull();
    expect(formatCouponExpiry("")).toBeNull();
    expect(formatCouponExpiry("not-a-date")).toBeNull();
  });
});
