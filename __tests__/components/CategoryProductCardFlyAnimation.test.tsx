import React from "react";
import { renderWithProviders, fireEvent, act } from "@/__tests__/test-utils/renderWithProviders";
import { CategoryProductCard } from "@/src/features/categories/products/sections/CategoryProductCard";
import { useCartActions } from "@/src/features/cart/hooks/useCartActions";
import { useFlyToCartTrigger } from "@/src/components/animations/flyToCart";
import { Animated } from "react-native";

jest.mock("@/src/features/product/hooks/useProduct", () => ({
  usePrefetchProduct: () => jest.fn(),
}));

jest.mock("@/src/components/animations/flyToCart", () => ({
  useFlyToCartTrigger: jest.fn(),
}));

jest.mock("@/src/features/cart/hooks/useCartActions", () => ({
  useCartActions: jest.fn(),
}));

const mockUseCartActions = useCartActions as jest.MockedFunction<typeof useCartActions>;
const mockUseFlyToCartTrigger = useFlyToCartTrigger as jest.MockedFunction<typeof useFlyToCartTrigger>;

describe("CategoryProductCard Fly-To-Cart Animation Gating", () => {
  const mockIncrement = jest.fn();
  const mockDecrement = jest.fn();
  const mockTriggerFly = jest.fn();

  const mockProduct = {
    id: "med-500mg",
    productId: "prod-1",
    name: "Medicine A 500mg",
    slug: "medicine-a-500mg",
    price: 50,
    originalPrice: 60,
    discount: "16% OFF",
    discountPercent: 16,
    description: "Tablet",
    image: "https://example.com/med.png",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockIncrement.mockResolvedValue(true);
    mockUseFlyToCartTrigger.mockReturnValue({
      imageRef: { current: null },
      triggerFly: mockTriggerFly,
    });
  });

  it("triggers fly animation when first adding an item (count === 0 -> tap ADD)", async () => {
    mockUseCartActions.mockReturnValue({
      count: 0,
      increment: mockIncrement,
      decrement: mockDecrement,
      animations: {
        slideAnim: new Animated.Value(0),
        opacityAnim: new Animated.Value(1),
      },
      isPending: false,
    } as never);

    const { getByText } = renderWithProviders(
      <CategoryProductCard product={mockProduct as never} cardWidth={180} onPress={jest.fn()} />,
    );

    const addBtn = getByText("ADD");
    await act(async () => {
      fireEvent.press(addBtn);
    });

    expect(mockIncrement).toHaveBeenCalledTimes(1);
    expect(mockTriggerFly).toHaveBeenCalledTimes(1);
  });

  it("does NOT trigger fly animation when incrementing quantity (count === 1 -> tap +)", async () => {
    mockUseCartActions.mockReturnValue({
      count: 1,
      increment: mockIncrement,
      decrement: mockDecrement,
      animations: {
        slideAnim: new Animated.Value(0),
        opacityAnim: new Animated.Value(1),
      },
      isPending: false,
    } as never);

    const { getByText } = renderWithProviders(
      <CategoryProductCard product={mockProduct as never} cardWidth={180} onPress={jest.fn()} />,
    );

    const plusBtn = getByText("+");
    await act(async () => {
      fireEvent.press(plusBtn);
    });

    expect(mockIncrement).toHaveBeenCalledTimes(1);
    expect(mockTriggerFly).not.toHaveBeenCalled();
  });

  it("does NOT trigger fly animation when incrementing quantity from 2 -> 3 (count === 2 -> tap +)", async () => {
    mockUseCartActions.mockReturnValue({
      count: 2,
      increment: mockIncrement,
      decrement: mockDecrement,
      animations: {
        slideAnim: new Animated.Value(0),
        opacityAnim: new Animated.Value(1),
      },
      isPending: false,
    } as never);

    const { getByText } = renderWithProviders(
      <CategoryProductCard product={mockProduct as never} cardWidth={180} onPress={jest.fn()} />,
    );

    const plusBtn = getByText("+");
    await act(async () => {
      fireEvent.press(plusBtn);
    });

    expect(mockIncrement).toHaveBeenCalledTimes(1);
    expect(mockTriggerFly).not.toHaveBeenCalled();
  });
});
