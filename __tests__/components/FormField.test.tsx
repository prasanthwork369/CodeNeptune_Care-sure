import React from "react";
import { renderWithProviders, fireEvent } from "@/__tests__/test-utils/renderWithProviders";
import { FormField } from "@/src/components/ui/FormField";
import { Text } from "react-native";

describe("FormField Component", () => {
  const onChangeTextMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders label and placeholder text correctly", () => {
    const { getByText, getByPlaceholderText } = renderWithProviders(
      <FormField
        label="Full Name"
        value=""
        placeholder="Enter your full name"
        onChangeText={onChangeTextMock}
      />
    );

    expect(getByText("Full Name")).toBeTruthy();
    expect(getByPlaceholderText("Enter your full name")).toBeTruthy();
  });

  it("accepts text input and calls onChangeText", () => {
    const { getByPlaceholderText } = renderWithProviders(
      <FormField
        label="Email"
        value=""
        placeholder="Enter your email"
        onChangeText={onChangeTextMock}
      />
    );

    const input = getByPlaceholderText("Enter your email");
    fireEvent.changeText(input, "user@example.com");

    expect(onChangeTextMock).toHaveBeenCalledWith("user@example.com");
  });

  it("displays error message when error prop is provided", () => {
    const { getByText } = renderWithProviders(
      <FormField
        label="Pincode"
        value="123"
        error="Pincode must be 6 digits"
        onChangeText={onChangeTextMock}
      />
    );

    expect(getByText("Pincode must be 6 digits")).toBeTruthy();
  });

  it("renders required mark indicator when required prop is true", () => {
    const { getByText } = renderWithProviders(
      <FormField
        label="Phone Number"
        value=""
        required={true}
        onChangeText={onChangeTextMock}
      />
    );

    expect(getByText("*")).toBeTruthy();
  });

  it("renders boxed variant with rightSlot action", () => {
    const { getByText, getByPlaceholderText } = renderWithProviders(
      <FormField
        label="Coupon Code"
        value="SAVE20"
        variant="boxed"
        placeholder="Enter code"
        rightSlot={<Text>VERIFIED</Text>}
        onChangeText={onChangeTextMock}
      />
    );

    expect(getByText("Coupon Code")).toBeTruthy();
    expect(getByPlaceholderText("Enter code")).toBeTruthy();
    expect(getByText("VERIFIED")).toBeTruthy();
  });
});
