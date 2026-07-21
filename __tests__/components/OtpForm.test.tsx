import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { TextInput } from "react-native";
import { OtpForm } from "@/src/components/auth/sections/OtpForm";

describe("OtpForm Component", () => {
  const defaultProps = {
    slots: ["1", "2", "3", "", "", ""],
    inputValue: "123",
    otpError: "",
    error: "",
    loading: false,
    resendCooldown: 30,
    activeIndex: 3,
    onBoxPress: jest.fn(),
    onOtpChange: jest.fn(),
    onResend: jest.fn(),
    inputRef: React.createRef<TextInput>(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders OTP digit slots and resend countdown timer", () => {
    const { getByText } = render(<OtpForm {...defaultProps} />);

    expect(getByText("1")).toBeTruthy();
    expect(getByText("2")).toBeTruthy();
    expect(getByText("3")).toBeTruthy();
    expect(getByText(/Resend OTP in/i)).toBeTruthy();
    expect(getByText("30s")).toBeTruthy();
  });

  it("renders Resend OTP button when cooldown reaches 0", () => {
    const { getByText, queryByText } = render(
      <OtpForm {...defaultProps} resendCooldown={0} />
    );

    expect(queryByText("Resend OTP in")).toBeNull();
    expect(getByText("Resend OTP")).toBeTruthy();
  });

  it("triggers onResend callback when Resend OTP button is pressed", () => {
    const onResend = jest.fn();
    const { getByText } = render(
      <OtpForm {...defaultProps} resendCooldown={0} onResend={onResend} />
    );

    fireEvent.press(getByText("Resend OTP"));
    expect(onResend).toHaveBeenCalledTimes(1);
  });

  it("displays otpError text when provided", () => {
    const { getByText } = render(
      <OtpForm {...defaultProps} otpError="Invalid OTP code. Please try again." />
    );

    expect(getByText("Invalid OTP code. Please try again.")).toBeTruthy();
  });
});
