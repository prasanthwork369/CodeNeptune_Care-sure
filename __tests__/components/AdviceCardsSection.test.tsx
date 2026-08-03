import { renderWithProviders } from "@/__tests__/test-utils/renderWithProviders";
import { AdviceCardsSection } from "@/src/components/product/details/sections/moreinfo/AdviceCardsSection";
import React from "react";
import { ScrollView } from "react-native";

describe("AdviceCardsSection", () => {
  it("allows horizontal scrolling inside the product details scroller", () => {
    const { UNSAFE_getByType } = renderWithProviders(
      <AdviceCardsSection
        items={[
          { title: "Alcohol", description: "Avoid drinking alcohol." },
          { title: "Driving", description: "Use caution while driving." },
        ]}
      />,
    );

    const scrollView = UNSAFE_getByType(ScrollView);

    expect(scrollView.props.horizontal).toBe(true);
    expect(scrollView.props.scrollEnabled).toBe(true);
    expect(scrollView.props.nestedScrollEnabled).toBe(true);
    expect(scrollView.props.canCancelContentTouches).toBe(false);
  });
});
