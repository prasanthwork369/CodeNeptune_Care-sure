import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { SearchSuggestionsBar } from "@/src/features/search/sections/SearchSuggestionsBar";

describe("SearchSuggestionsBar — simple vertical suggestion list", () => {
  it("renders nothing when there are no suggestions", () => {
    const { toJSON } = render(
      <SearchSuggestionsBar suggestions={[]} onSelect={jest.fn()} />,
    );

    expect(toJSON()).toBeNull();
  });

  it("renders every suggestion as a vertical row with no expand/collapse control", () => {
    const { getByText, queryByText } = render(
      <SearchSuggestionsBar
        suggestions={["paracetamol", "paracetamol 650", "azithromycin"]}
        onSelect={jest.fn()}
      />,
    );

    expect(getByText("paracetamol")).toBeTruthy();
    expect(getByText("paracetamol 650")).toBeTruthy();
    expect(getByText("azithromycin")).toBeTruthy();
    expect(queryByText(/show more/i)).toBeNull();
    expect(queryByText(/show less/i)).toBeNull();
  });

  it("calls onSelect with the tapped suggestion", () => {
    const onSelect = jest.fn();
    const { getByText } = render(
      <SearchSuggestionsBar
        suggestions={["paracetamol"]}
        onSelect={onSelect}
      />,
    );

    fireEvent.press(getByText("paracetamol"));

    expect(onSelect).toHaveBeenCalledWith("paracetamol");
  });
});
