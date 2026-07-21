import React from "react";
import { renderWithProviders, fireEvent, waitFor } from "@/__tests__/test-utils/renderWithProviders";
import { CartCouponSection } from "@/src/components/cart/sections/CartCouponSection";
import { useCoupons } from "@/src/hooks/queries/useCoupons";
import { couponService } from "@/src/services/coupon.service";
import { useCouponStore } from "@/src/store/couponStore";

jest.mock("@/src/hooks/queries/useCoupons");
jest.mock("@/src/services/coupon.service");
jest.mock("@/src/hooks/useNav", () => ({
  useNav: () => ({
    push: jest.fn(),
  }),
}));

const mockUseCoupons = useCoupons as jest.MockedFunction<typeof useCoupons>;

describe("CartCouponSection Component", () => {
  const onRemoveMock = jest.fn();

  const mockCouponList = [
    {
      id: "coup-1",
      code: "SAVE20",
      description: "20% OFF on all orders",
      discountType: "PERCENTAGE" as const,
      discountValue: 20,
      minOrderValue: 200,
      maxDiscountAmount: 100,
      termsAndConditions: [],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseCoupons.mockReturnValue({
      data: mockCouponList,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    } as any);
  });

  it("renders applied coupon info and calls onRemove when Remove is pressed", () => {
    const appliedCoupon = {
      code: "SAVE20",
      discount: 40,
      description: "20% OFF on all orders",
    };

    const { getByText } = renderWithProviders(
      <CartCouponSection
        appliedCoupon={appliedCoupon}
        onRemove={onRemoveMock}
        subtotal={500}
      />
    );

    expect(getByText("SAVE20")).toBeTruthy();
    expect(getByText(/saved/i)).toBeTruthy();

    const removeBtn = getByText("Remove");
    fireEvent.press(removeBtn);
    expect(onRemoveMock).toHaveBeenCalledTimes(1);
  });

  it("renders coupon offers card when no coupon is applied", () => {
    const { getByText } = renderWithProviders(
      <CartCouponSection
        appliedCoupon={null}
        onRemove={onRemoveMock}
        subtotal={500}
      />
    );

    expect(getByText("Coupons & offers")).toBeTruthy();
    expect(getByText(/Save/i)).toBeTruthy();
    expect(getByText("Apply")).toBeTruthy();
  });

  it("calls couponService.validateCoupon when Apply is pressed", async () => {
    (couponService.validateCoupon as jest.Mock).mockResolvedValueOnce({
      valid: true,
      discount: 50,
      message: "Coupon applied successfully!",
    });

    const applyStoreMock = jest.fn();
    useCouponStore.setState({ apply: applyStoreMock });

    const { getByText } = renderWithProviders(
      <CartCouponSection
        appliedCoupon={null}
        onRemove={onRemoveMock}
        subtotal={500}
      />
    );

    const applyBtn = getByText("Apply");
    fireEvent.press(applyBtn);

    await waitFor(() => {
      expect(couponService.validateCoupon).toHaveBeenCalledWith("SAVE20", 500);
      expect(applyStoreMock).toHaveBeenCalledWith({
        code: "SAVE20",
        discount: 50,
        description: "Coupon applied successfully!",
      });
    });
  });

  it("renders skeleton loader when coupons data is loading", () => {
    mockUseCoupons.mockReturnValueOnce({
      data: [],
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    } as any);

    const { queryByText } = renderWithProviders(
      <CartCouponSection
        appliedCoupon={null}
        onRemove={onRemoveMock}
        subtotal={500}
      />
    );

    expect(queryByText("Coupons & offers")).toBeNull();
  });
});
