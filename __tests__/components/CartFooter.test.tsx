import React from "react";
import {
  renderWithProviders,
  fireEvent,
} from "@/__tests__/test-utils/renderWithProviders";
import { CartFooter } from "@/src/features/cart/sections/CartFooter";

describe("CartFooter Component", () => {
  const onProceedMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders total price formatted to 2 decimal places and action button", () => {
    const { getByText } = renderWithProviders(
      <CartFooter
        toPay={450.5}
        safeAreaBottom={20}
        onProceed={onProceedMock}
        canProceed={true}
      />,
    );

    expect(getByText("To Pay")).toBeTruthy();
    expect(getByText("₹450.50")).toBeTruthy();
    expect(getByText("Proceed to pay")).toBeTruthy();
  });

  it("triggers onProceed callback when Proceed To Pay is pressed", () => {
    const { getByText } = renderWithProviders(
      <CartFooter
        toPay={199.99}
        safeAreaBottom={0}
        onProceed={onProceedMock}
        canProceed={true}
      />,
    );

    fireEvent.press(getByText("Proceed to pay"));
    expect(onProceedMock).toHaveBeenCalledTimes(1);
  });

  it("disables button and prevents onProceed callback when canProceed is false", () => {
    const { getByText } = renderWithProviders(
      <CartFooter
        toPay={0}
        safeAreaBottom={0}
        onProceed={onProceedMock}
        canProceed={false}
      />,
    );

    fireEvent.press(getByText("Proceed to pay"));
    expect(onProceedMock).not.toHaveBeenCalled();
  });
});
