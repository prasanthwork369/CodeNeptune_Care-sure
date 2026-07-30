import { CartSavingsBanner } from "@/src/components/cart/sections/CartSavingsBanner";
import { renderWithProviders } from "@/__tests__/test-utils/renderWithProviders";
import React from "react";

describe("CartSavingsBanner", () => {
  it("updates the displayed amount without remounting the banner", () => {
    const { getByText, rerender } = renderWithProviders(
      <CartSavingsBanner firstName="Asha" totalSavings={125} />,
    );

    expect(getByText("₹125")).toBeTruthy();

    rerender(<CartSavingsBanner firstName="Asha" totalSavings={175.5} />);

    expect(getByText("₹175.5")).toBeTruthy();
  });
});
