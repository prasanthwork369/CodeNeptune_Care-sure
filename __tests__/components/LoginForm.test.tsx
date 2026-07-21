import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { LoginForm } from "@/src/components/auth/sections/LoginForm";

describe("LoginForm Component", () => {
  const defaultProps = {
    phoneNumber: "",
    phoneError: "",
    error: "",
    onPhoneChange: jest.fn(),
    onPhoneFocus: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders phone input with +91 prefix and placeholder", () => {
    const { getByTestId, getByText, getByPlaceholderText } = render(
      <LoginForm {...defaultProps} />
    );

    expect(getByText("+91")).toBeTruthy();
    expect(getByPlaceholderText("Enter your mobile number")).toBeTruthy();
    expect(getByTestId("phone-input")).toBeTruthy();
  });

  it("filters non-digit inputs and calls onPhoneChange with sanitized digits", () => {
    const onPhoneChange = jest.fn();
    const { getByTestId } = render(
      <LoginForm {...defaultProps} onPhoneChange={onPhoneChange} />
    );

    const input = getByTestId("phone-input");
    fireEvent.changeText(input, "987-654-3210");

    // sanitize.phone strips non-digits
    expect(onPhoneChange).toHaveBeenCalledWith("9876543210");
  });

  it("displays phoneError when provided", () => {
    const { getByText } = render(
      <LoginForm {...defaultProps} phoneError="Invalid mobile number" />
    );

    expect(getByText("Invalid mobile number")).toBeTruthy();
  });

  it("triggers onPhoneFocus on input focus", () => {
    const onPhoneFocus = jest.fn();
    const { getByTestId } = render(
      <LoginForm {...defaultProps} onPhoneFocus={onPhoneFocus} />
    );

    const input = getByTestId("phone-input");
    fireEvent(input, "focus");

    expect(onPhoneFocus).toHaveBeenCalledTimes(1);
  });
});
