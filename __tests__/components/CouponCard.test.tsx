import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { CouponCard } from "@/src/features/cart/coupons/CouponCard";
import { COUPON_DISCOUNT_TYPE } from "@/src/features/cart/constants/coupon";
import { Coupon } from "@/src/features/cart/types";

const mockCoupon: Coupon = {
  id: "coupon-1",
  code: "SAVE20",
  discountType: COUPON_DISCOUNT_TYPE.PERCENTAGE,
  discountValue: 20,
  maxDiscountAmount: 100,
  minOrderValue: 500,
  maxUses: 100,
  maxUsesPerCustomer: 1,
  startsAt: "2026-01-01T00:00:00Z",
  expiresAt: "2026-12-31T23:59:59Z",
  status: 1,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

describe("CouponCard status and label priority (D_id_224)", () => {
  const onApply = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // A. Used + below minimum -> "USED" + disabled
  it("renders 'USED' and is disabled when coupon is used and cart is below minimum", () => {
    const { getByText } = render(
      <CouponCard
        coupon={mockCoupon}
        onApply={onApply}
        disabled={true} // subtotal < minOrderValue
        isApplied={false}
        isUnavailable={true} // coupon.isUsedUp
      />,
    );

    const buttonText = getByText("USED");
    expect(buttonText).toBeTruthy();

    fireEvent.press(buttonText);
    expect(onApply).not.toHaveBeenCalled();
  });

  // B. Used + above minimum -> "USED" + disabled
  it("renders 'USED' and is disabled when coupon is used and cart is above minimum", () => {
    const { getByText } = render(
      <CouponCard
        coupon={mockCoupon}
        onApply={onApply}
        disabled={false} // subtotal >= minOrderValue
        isApplied={false}
        isUnavailable={true} // coupon.isUsedUp
      />,
    );

    const buttonText = getByText("USED");
    expect(buttonText).toBeTruthy();

    fireEvent.press(buttonText);
    expect(onApply).not.toHaveBeenCalled();
  });

  // C. Unused + below minimum -> "APPLY" + disabled
  it("renders 'APPLY' and is disabled when unused but cart is below minimum", () => {
    const { getByText } = render(
      <CouponCard
        coupon={mockCoupon}
        onApply={onApply}
        disabled={true} // subtotal < minOrderValue
        isApplied={false}
        isUnavailable={false}
      />,
    );

    const buttonText = getByText("APPLY");
    expect(buttonText).toBeTruthy();

    fireEvent.press(buttonText);
    expect(onApply).not.toHaveBeenCalled();
  });

  // D. Unused + eligible -> "APPLY" + enabled
  it("renders 'APPLY' and calls onApply when unused and cart meets minimum", () => {
    const { getByText } = render(
      <CouponCard
        coupon={mockCoupon}
        onApply={onApply}
        disabled={false} // subtotal >= minOrderValue
        isApplied={false}
        isUnavailable={false}
      />,
    );

    const buttonText = getByText("APPLY");
    expect(buttonText).toBeTruthy();

    fireEvent.press(buttonText);
    expect(onApply).toHaveBeenCalledWith("SAVE20");
  });

  // E. Applied coupon -> "APPLIED" + disabled
  it("renders 'APPLIED' and is disabled when coupon is currently applied", () => {
    const { getByText } = render(
      <CouponCard
        coupon={mockCoupon}
        onApply={onApply}
        disabled={false}
        isApplied={true}
        isUnavailable={false}
      />,
    );

    const buttonText = getByText("APPLIED");
    expect(buttonText).toBeTruthy();

    fireEvent.press(buttonText);
    expect(onApply).not.toHaveBeenCalled();
  });
});
