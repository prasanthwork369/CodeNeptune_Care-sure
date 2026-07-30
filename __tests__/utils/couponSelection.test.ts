import { COUPON_DISCOUNT_TYPE } from "@/src/constants/coupon";
import { Coupon } from "@/src/types/cart";
import {
  computeCouponDiscount,
  selectCartCoupon,
} from "@/src/utils/couponSelection";

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

describe("computeCouponDiscount", () => {
  it("returns the face value of a flat coupon", () => {
    expect(
      computeCouponDiscount(coupon({ code: "FLAT50", discountValue: 50 }), 900),
    ).toBe(50);
  });

  it("caps a percentage coupon at maxDiscountAmount", () => {
    const c = coupon({
      code: "PCT20",
      discountType: COUPON_DISCOUNT_TYPE.PERCENTAGE,
      discountValue: 20,
      maxDiscountAmount: 100,
    });
    expect(computeCouponDiscount(c, 1000)).toBe(100);
    expect(computeCouponDiscount(c, 400)).toBe(80);
  });
});

describe("selectCartCoupon", () => {
  it("returns null with no coupons", () => {
    expect(selectCartCoupon([], 500)).toBeNull();
  });

  // The reported bug: a big locked coupon was scored at its own threshold and always won.
  it("prefers an achievable coupon over a larger locked one", () => {
    const small = coupon({
      code: "SAVE50",
      discountValue: 50,
      minOrderValue: 100,
    });
    const huge = coupon({
      code: "SAVE500",
      discountValue: 500,
      minOrderValue: 5000,
    });

    const pick = selectCartCoupon([huge, small], 200);

    expect(pick?.coupon.code).toBe("SAVE50");
    expect(pick?.isLocked).toBe(false);
    expect(pick?.savings).toBe(50);
    expect(pick?.remaining).toBe(0);
  });

  it("picks the highest real savings among unlocked coupons", () => {
    const flat = coupon({ code: "FLAT60", discountValue: 60 });
    const pct = coupon({
      code: "PCT20",
      discountType: COUPON_DISCOUNT_TYPE.PERCENTAGE,
      discountValue: 20,
    });

    // At a 1000 subtotal the percentage coupon is worth 200, so it wins.
    expect(selectCartCoupon([flat, pct], 1000)?.coupon.code).toBe("PCT20");
    // At a 200 subtotal it is only worth 40, so the flat coupon wins.
    expect(selectCartCoupon([flat, pct], 200)?.coupon.code).toBe("FLAT60");
  });

  it("surfaces the nearest threshold when everything is locked", () => {
    const near = coupon({
      code: "NEAR",
      discountValue: 30,
      minOrderValue: 300,
    });
    const far = coupon({
      code: "FAR",
      discountValue: 900,
      minOrderValue: 9000,
    });

    const pick = selectCartCoupon([far, near], 250);

    expect(pick?.coupon.code).toBe("NEAR");
    expect(pick?.isLocked).toBe(true);
    expect(pick?.remaining).toBe(50);
    expect(pick?.savings).toBe(30);
  });

  it("treats a subtotal exactly on the threshold as unlocked", () => {
    const c = coupon({ code: "EXACT", discountValue: 10, minOrderValue: 500 });
    const pick = selectCartCoupon([c], 500);

    expect(pick?.isLocked).toBe(false);
    expect(pick?.remaining).toBe(0);
  });

  it("is stable when two coupons are worth the same", () => {
    const a = coupon({ code: "AAA", discountValue: 40 });
    const b = coupon({ code: "BBB", discountValue: 40 });

    expect(selectCartCoupon([a, b], 800)?.coupon.code).toBe("AAA");
    expect(selectCartCoupon([b, a], 800)?.coupon.code).toBe("AAA");
  });

  // A limit-reached coupon used to be recommended and then failed on Apply.
  it("skips coupons the backend rejected and falls back to the next best", () => {
    const rejected = coupon({ code: "USEDUP", discountValue: 200 });
    const usable = coupon({ code: "OK50", discountValue: 50 });

    const pick = selectCartCoupon(
      [rejected, usable],
      1000,
      new Set(["USEDUP"]),
    );

    expect(pick?.coupon.code).toBe("OK50");
  });

  it("returns null when every coupon was rejected", () => {
    const a = coupon({ code: "A", discountValue: 10 });
    const b = coupon({ code: "B", discountValue: 20 });

    expect(selectCartCoupon([a, b], 1000, new Set(["A", "B"]))).toBeNull();
  });

  it("ignores rejected coupons when picking the nearest locked one", () => {
    const rejectedNear = coupon({
      code: "NEARBAD",
      discountValue: 30,
      minOrderValue: 300,
    });
    const usableFar = coupon({
      code: "FAROK",
      discountValue: 90,
      minOrderValue: 900,
    });

    const pick = selectCartCoupon(
      [rejectedNear, usableFar],
      250,
      new Set(["NEARBAD"]),
    );

    expect(pick?.coupon.code).toBe("FAROK");
    expect(pick?.isLocked).toBe(true);
    expect(pick?.remaining).toBe(650);
  });

  it("prefers the lower threshold when savings tie", () => {
    const low = coupon({ code: "LOW", discountValue: 40, minOrderValue: 100 });
    const high = coupon({
      code: "HIGH",
      discountValue: 40,
      minOrderValue: 400,
    });

    expect(selectCartCoupon([high, low], 800)?.coupon.code).toBe("LOW");
  });
});
