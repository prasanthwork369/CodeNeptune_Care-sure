import {
  fireEvent,
  renderWithProviders,
  waitFor,
} from "@/__tests__/test-utils/renderWithProviders";
import { CartCouponSection } from "@/src/components/cart/sections/CartCouponSection";
import { COUPON_DISCOUNT_TYPE } from "@/src/constants/coupon";
import { useCoupons } from "@/src/hooks/queries/useCoupons";
import { couponService } from "@/src/services/coupon.service";
import { useCouponStore } from "@/src/store/couponStore";
import React from "react";

jest.mock("@/src/hooks/queries/useCoupons");
jest.mock("@/src/services/coupon.service");
jest.mock("@/src/hooks/useNav", () => ({
  useNav: () => ({
    push: jest.fn(),
  }),
}));

const mockUseCoupons = useCoupons as jest.MockedFunction<typeof useCoupons>;
const mockValidate = couponService.validateCoupon as jest.Mock;

describe("CartCouponSection Component", () => {
  const onRemoveMock = jest.fn();

  const mockCouponList = [
    {
      id: "coup-1",
      code: "SAVE20",
      description: "20% OFF on all orders",
      discountType: COUPON_DISCOUNT_TYPE.PERCENTAGE,
      discountValue: 20,
      minOrderValue: 200,
      maxDiscountAmount: 100,
      expiresAt: "2027-08-12T00:00:00Z",
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
    mockValidate.mockResolvedValue({
      valid: true,
      discount: 50,
      message: "Coupon applied successfully!",
    });
  });

  it("renders applied coupon info and calls onRemove when Remove is pressed", async () => {
    const appliedCoupon = {
      code: "SAVE20",
      discount: 40,
      description: "20% OFF on all orders",
    };

    const { getByText, findByText } = renderWithProviders(
      <CartCouponSection
        appliedCoupon={appliedCoupon}
        onRemove={onRemoveMock}
        subtotal={500}
      />,
    );

    expect(await findByText("SAVE20")).toBeTruthy();
    expect(getByText(/saved/i)).toBeTruthy();

    fireEvent.press(getByText("Remove"));
    expect(onRemoveMock).toHaveBeenCalledTimes(1);
  });

  it("renders coupon offers card when no coupon is applied", async () => {
    const { findByText, getByText, queryByText } = renderWithProviders(
      <CartCouponSection
        appliedCoupon={null}
        onRemove={onRemoveMock}
        subtotal={500}
      />,
    );

    expect(await findByText("Coupons & offers")).toBeTruthy();
    expect(getByText(/Save/i)).toBeTruthy();
    expect(getByText("Apply")).toBeTruthy();
    // Terms and expiry belong to the coupons screen; the cart card stays to the headline and nudge.
    expect(queryByText(/off on orders above/)).toBeNull();
    expect(queryByText(/Expires/)).toBeNull();
  });

  it("calls couponService.validateCoupon when Apply is pressed", async () => {
    const applyStoreMock = jest.fn();
    useCouponStore.setState({ apply: applyStoreMock });

    const { findByText } = renderWithProviders(
      <CartCouponSection
        appliedCoupon={null}
        onRemove={onRemoveMock}
        subtotal={500}
      />,
    );

    fireEvent.press(await findByText("Apply"));

    await waitFor(() => {
      expect(mockValidate).toHaveBeenCalledWith("SAVE20", 500);
      expect(applyStoreMock).toHaveBeenCalledWith({
        code: "SAVE20",
        discount: 50,
        description: "Coupon applied successfully!",
      });
    });
  });

  // The reported bug: a used-up coupon was recommended and only failed once Apply was tapped.
  // Availability now rides on the coupons payload rather than a validate probe.
  it("does not recommend a coupon the backend has marked used up", async () => {
    mockUseCoupons.mockReturnValue({
      data: [{ ...mockCouponList[0], isUsedUp: true }],
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    } as any);

    const { findByText, queryByText } = renderWithProviders(
      <CartCouponSection
        appliedCoupon={null}
        onRemove={onRemoveMock}
        subtotal={500}
      />,
    );

    expect(await findByText("Apply Coupon")).toBeTruthy();
    expect(queryByText("Coupons & offers")).toBeNull();
  });

  it("renders skeleton loader when coupons data is loading", () => {
    // Not `Once` -- the card re-renders while it settles, and loading must stay true throughout.
    mockUseCoupons.mockReturnValue({
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
      />,
    );

    expect(queryByText("Coupons & offers")).toBeNull();
  });
});
