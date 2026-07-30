import React from "react";
import {
  renderWithProviders,
  fireEvent,
} from "@/__tests__/test-utils/renderWithProviders";
import { SearchProductCard } from "@/src/components/search/SearchProductCard";
import { useCartActions } from "@/src/hooks/useCartActions";
import { Animated } from "react-native";

const mockPush = jest.fn();
jest.mock("@/src/hooks/useNav", () => ({
  useNav: () => ({
    push: mockPush,
  }),
}));

jest.mock("@/src/hooks/useCartActions");
const mockUseCartActions = useCartActions as jest.MockedFunction<
  typeof useCartActions
>;

describe("SearchProductCard Component", () => {
  const mockIncrement = jest.fn();
  const mockDecrement = jest.fn();

  const mockData = {
    id: "med-101",
    productId: "prod-101",
    slug: "paracetamol-500mg",
    requiresPrescription: false,
    searched: {
      name: "Crocin 500mg Tablet",
      brandName: "GlaxoSmithKline",
      description: "Strip of 15 tablets",
      price: 45.0,
      status: "Costlier Brand",
    },
    recommended: {
      name: "Paracetamol 500mg Tablet",
      manufacturer: "Generic Labs",
      price: 15.0,
      originalPrice: 45.0,
      savings: 30.0,
      description: "Strip of 15 tablets",
      packSize: "15 tablets",
      unit: "strip",
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseCartActions.mockReturnValue({
      count: 0,
      increment: mockIncrement,
      decrement: mockDecrement,
      animations: {
        slideAnim: new Animated.Value(0),
        opacityAnim: new Animated.Value(1),
      },
      isPending: false,
    } as any);
  });

  it("renders searched and recommended product details with prices and savings", () => {
    const { getByText, getAllByText } = renderWithProviders(
      <SearchProductCard data={mockData} />,
    );

    expect(getByText("Crocin 500mg Tablet")).toBeTruthy();
    expect(getByText("Paracetamol 500mg Tablet")).toBeTruthy();
    expect(getAllByText("₹45.00").length).toBeGreaterThan(0);
    expect(getByText("₹15.00")).toBeTruthy();
    expect(getByText("Save ₹30.00")).toBeTruthy();
    expect(getByText("SAME COMPOSITION")).toBeTruthy();
    expect(getByText("Add")).toBeTruthy();
  });

  it("triggers increment when Add button is pressed", () => {
    const { getByText } = renderWithProviders(
      <SearchProductCard data={mockData} />,
    );

    const addBtn = getByText("Add");
    fireEvent.press(addBtn);

    expect(mockIncrement).toHaveBeenCalledTimes(1);
  });

  it("renders quantity counter controls when item is already in cart", () => {
    mockUseCartActions.mockReturnValueOnce({
      count: 3,
      increment: mockIncrement,
      decrement: mockDecrement,
      animations: {
        slideAnim: new Animated.Value(0),
        opacityAnim: new Animated.Value(1),
      },
      isPending: false,
    } as any);

    const { getByText } = renderWithProviders(
      <SearchProductCard data={mockData} />,
    );

    expect(getByText("3")).toBeTruthy();

    const plusBtn = getByText("+");
    const minusBtn = getByText("−");

    fireEvent.press(plusBtn);
    expect(mockIncrement).toHaveBeenCalledTimes(1);

    fireEvent.press(minusBtn);
    expect(mockDecrement).toHaveBeenCalledTimes(1);
  });

  it("triggers navigation callback when card is pressed", () => {
    const { getByTestId } = renderWithProviders(
      <SearchProductCard data={mockData} />,
    );

    const card = getByTestId("search-result-item");
    fireEvent.press(card);

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/search/product/[id]",
      params: { id: "prod-101" },
    });
  });
});
