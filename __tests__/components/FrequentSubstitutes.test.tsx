import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { FrequentSubstitutes } from "@/src/features/home/sections/FrequentSubstitutes";
import type { SubstituteProduct } from "@/src/features/product/types";

jest.mock("@/src/constants/icons", () => ({
  icons: {
    placeholder: (props: any) => {
      const { View } = require("react-native");
      return <View testID="icon-placeholder" {...props} />;
    },
  },
}));

jest.mock("@/src/components/animations/flyToCart", () => ({
  useFlyToCartTrigger: () => ({
    imageRef: { current: null },
    triggerFly: jest.fn(),
  }),
}));

jest.mock("@/src/features/cart/hooks/useCartActions", () => ({
  useCartActions: () => ({
    count: 0,
    increment: jest.fn(),
    decrement: jest.fn(),
    isPending: false,
    animations: {
      slideAnim: { interpolate: () => 0 },
      opacityAnim: 1,
    },
  }),
}));

jest.mock("@/src/features/product/hooks/useProduct", () => ({
  usePrefetchProduct: () => jest.fn(),
}));

jest.mock("expo-image", () => {
  const { View } = require("react-native");
  return {
    Image: ({ onError, testID = "expo-image", ...props }: any) => (
      <View testID={testID} {...props} />
    ),
  };
});

describe("FrequentSubstitutes Component", () => {
  const mockSubstitutes: SubstituteProduct[] = [
    {
      id: "med-1",
      productId: "prod-1",
      name: "Paracetamol 500mg",
      description: "Pain relief tablet",
      price: 45,
      originalPrice: 50,
      image: null,
    },
    {
      id: "med-2",
      productId: "prod-2",
      name: "Amoxicillin 250mg",
      description: "Antibiotic capsule",
      price: 120,
      image: { uri: "https://example.com/amoxicillin.jpg" },
    },
  ];

  it("renders placeholder icon immediately when image is null", () => {
    const { getAllByTestId } = render(
      <FrequentSubstitutes substitutes={mockSubstitutes} />,
    );

    const placeholders = getAllByTestId("icon-placeholder");
    expect(placeholders.length).toBeGreaterThanOrEqual(1);
  });

  it("renders both placeholder and remote image overlay when image URI is provided", () => {
    const { getAllByTestId } = render(
      <FrequentSubstitutes substitutes={mockSubstitutes} />,
    );

    const images = getAllByTestId("expo-image");
    expect(images.length).toBe(1);
  });
});
