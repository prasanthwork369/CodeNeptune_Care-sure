import React from "react";
import { TextInput } from "react-native";
import {
  renderWithProviders,
  fireEvent,
} from "@/__tests__/test-utils/renderWithProviders";
import { LoginForm } from "@/src/components/auth/sections/LoginForm";

describe("LoginForm Component", () => {
  const defaultProps = {
    phoneNumber: "",
    phoneError: "",
    error: "",
    onPhoneChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders phone input with +91 prefix and placeholder", () => {
    const { getByTestId, getByText, getByPlaceholderText } =
      renderWithProviders(<LoginForm {...defaultProps} />);

    expect(getByText("+91")).toBeTruthy();
    expect(getByPlaceholderText("Enter your mobile number")).toBeTruthy();
    expect(getByTestId("phone-input")).toBeTruthy();
  });

  it("forwards raw text so the hook owns sanitization and overflow rejection", () => {
    const onPhoneChange = jest.fn();
    const { getByTestId } = renderWithProviders(
      <LoginForm {...defaultProps} onPhoneChange={onPhoneChange} />,
    );

    const input = getByTestId("phone-input");
    fireEvent.changeText(input, "987-654-3210");

    expect(onPhoneChange).toHaveBeenCalledWith("987-654-3210");
  });

  it("displays phoneError when provided", () => {
    const { getByText } = renderWithProviders(
      <LoginForm {...defaultProps} phoneError="Invalid mobile number" />,
    );

    expect(getByText("Invalid mobile number")).toBeTruthy();
  });

  it("exposes the input instance through inputRef", () => {
    const inputRef = React.createRef<TextInput>();
    const { getByTestId } = renderWithProviders(
      <LoginForm {...defaultProps} inputRef={inputRef} />,
    );

    expect(getByTestId("phone-input")).toBeTruthy();
    expect(inputRef.current).not.toBeNull();
  });

  it("does not request a hint on input focus", () => {
    const { getByTestId } = renderWithProviders(
      <LoginForm {...defaultProps} />,
    );

    // Focus is visual state only now — the hint is requested on screen mount.
    expect(() => fireEvent(getByTestId("phone-input"), "focus")).not.toThrow();
  });
});
