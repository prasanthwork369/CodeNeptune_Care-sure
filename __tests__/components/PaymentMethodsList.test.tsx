import React from "react";
import {
  renderWithProviders,
  fireEvent,
} from "@/__tests__/test-utils/renderWithProviders";
import { PaymentMethodsList } from "@/src/components/payment/sections/PaymentMethodsList";
import { View } from "react-native";

describe("PaymentMethodsList Component", () => {
  const onSelectMock = jest.fn();

  const mockMethods = [
    {
      id: "upi",
      title: "UPI (Google Pay / PhonePe)",
      subtitle: "Instant & zero extra charges",
      icon: <View testID="upi-icon" />,
    },
    {
      id: "cod",
      title: "Cash on Delivery",
      subtitle: "Pay when your package arrives",
      icon: <View testID="cod-icon" />,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders section title and all payment methods", () => {
    const { getByText } = renderWithProviders(
      <PaymentMethodsList
        methods={mockMethods}
        selectedId="upi"
        onSelect={onSelectMock}
      />,
    );

    expect(getByText("Payment Method")).toBeTruthy();
    expect(getByText("UPI (Google Pay / PhonePe)")).toBeTruthy();
    expect(getByText("Cash on Delivery")).toBeTruthy();
    expect(getByText("Instant & zero extra charges")).toBeTruthy();
  });

  it("triggers onSelect callback with selected method ID when pressed", () => {
    const { getByText } = renderWithProviders(
      <PaymentMethodsList
        methods={mockMethods}
        selectedId="upi"
        onSelect={onSelectMock}
      />,
    );

    fireEvent.press(getByText("Cash on Delivery"));
    expect(onSelectMock).toHaveBeenCalledWith("cod");
  });
});
