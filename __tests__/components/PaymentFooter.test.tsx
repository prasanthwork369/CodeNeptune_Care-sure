import React from "react";
import {
  renderWithProviders,
  fireEvent,
} from "@/__tests__/test-utils/renderWithProviders";
import { PaymentFooter } from "@/src/features/checkout/sections/PaymentFooter";

jest.mock("@/assets/icons/arrow_forward_ios_white.svg", () => () => null);

describe("PaymentFooter Component", () => {
  const onPressMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders 'Confirm Order' button label when hasAddress is true", () => {
    const { getByText } = renderWithProviders(
      <PaymentFooter
        onPress={onPressMock}
        loading={false}
        hasAddress={true}
        safeAreaBottom={20}
      />,
    );

    expect(getByText("Confirm Order")).toBeTruthy();
  });

  it("renders 'Set Delivery Address' button label when hasAddress is false", () => {
    const { getByText } = renderWithProviders(
      <PaymentFooter
        onPress={onPressMock}
        loading={false}
        hasAddress={false}
        safeAreaBottom={0}
      />,
    );

    expect(getByText("Set Delivery Address")).toBeTruthy();
  });

  it("triggers onPress callback when footer button is pressed", () => {
    const { getByText } = renderWithProviders(
      <PaymentFooter
        onPress={onPressMock}
        loading={false}
        hasAddress={true}
        safeAreaBottom={0}
      />,
    );

    fireEvent.press(getByText("Confirm Order"));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it("shows ActivityIndicator and disables press when loading is true", () => {
    const { queryByText, UNSAFE_getByType } = renderWithProviders(
      <PaymentFooter
        onPress={onPressMock}
        loading={true}
        hasAddress={true}
        safeAreaBottom={0}
      />,
    );

    expect(queryByText("Confirm Order")).toBeNull();
    const activityIndicator = UNSAFE_getByType("ActivityIndicator" as any);
    expect(activityIndicator).toBeTruthy();
  });
});
