import React from "react";
import { renderWithProviders, fireEvent } from "@/__tests__/test-utils/renderWithProviders";
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
    const { getByTestId, getByText, getByPlaceholderText } = renderWithProviders(
      <LoginForm {...defaultProps} />
    );

    expect(getByText("+91")).toBeTruthy();
    expect(getByPlaceholderText("Enter your mobile number")).toBeTruthy();
    expect(getByTestId("phone-input")).toBeTruthy();
  });

  it("forwards raw text so the hook owns sanitization and overflow rejection", () => {
    const onPhoneChange = jest.fn();
    const { getByTestId } = renderWithProviders(
      <LoginForm {...defaultProps} onPhoneChange={onPhoneChange} />
    );

    const input = getByTestId("phone-input");
    fireEvent.changeText(input, "987-654-3210");

    expect(onPhoneChange).toHaveBeenCalledWith("987-654-3210");
  });

  it("displays phoneError when provided", () => {
    const { getByText } = renderWithProviders(
      <LoginForm {...defaultProps} phoneError="Invalid mobile number" />
    );

    expect(getByText("Invalid mobile number")).toBeTruthy();
  });

  it("triggers onPhoneFocus on input focus", () => {
    const onPhoneFocus = jest.fn();
    const { getByTestId } = renderWithProviders(
      <LoginForm {...defaultProps} onPhoneFocus={onPhoneFocus} />
    );

    const input = getByTestId("phone-input");
    fireEvent(input, "focus");

    expect(onPhoneFocus).toHaveBeenCalledTimes(1);
  });
});
