import React from "react";
import { screen } from "@testing-library/react-native";
import { renderWithProviders } from "@/__tests__/test-utils/renderWithProviders";
import { OtpLayout } from "@/src/features/auth/screens/OtpLayout";
import { useIsOffline } from "@/src/hooks/ui/useIsOffline";

jest.mock("@/src/hooks/ui/useIsOffline");

jest.mock("@/src/hooks/useNav", () => ({
  useNav: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn(),
  }),
}));

jest.mock("@/src/hooks/ui/useBottomInset", () => ({
  useAdjustedBottomInset: () => 0,
}));

jest.mock("react-native-keyboard-controller", () => ({
  KeyboardEvents: {
    addListener: jest.fn(() => ({ remove: jest.fn() })),
  },
}));

jest.mock("@/src/features/auth/components/AuthMedicineBackground", () => ({
  AuthMedicineBackground: () => null,
}));

jest.mock("@/src/features/auth/hooks/useOtp", () => ({
  useOtp: () => ({
    router: { back: jest.fn(), push: jest.fn() },
    phone: "9876543210",
    slots: ["", "", "", "", "", ""],
    inputValue: "",
    otpError: "",
    error: null,
    resendCooldown: 30,
    isButtonLoading: false,
    isValid: false,
    inputRef: { current: null },
    activeIndex: 0,
    handleBoxPress: jest.fn(),
    handleResend: jest.fn(),
    handleOtpChange: jest.fn(),
    handleVerify: jest.fn(),
  }),
}));

jest.mock("expo-router", () => ({
  useFocusEffect: (cb: () => void) => cb(),
  useIsFocused: () => true,
}));

describe("OtpLayout Offline State", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders full-screen NoInternetState when offline", () => {
    (useIsOffline as jest.Mock).mockReturnValue(true);

    renderWithProviders(<OtpLayout />);

    expect(screen.getByText("No Internet Connection")).toBeTruthy();
    expect(screen.getByText("Please check your network")).toBeTruthy();
    expect(screen.getByText("Try again")).toBeTruthy();
    expect(screen.queryByText("Verify OTP")).toBeNull();
    expect(screen.queryByText("Verify & Continue")).toBeNull();
  });

  it("renders OTP verification form when online", () => {
    (useIsOffline as jest.Mock).mockReturnValue(false);

    renderWithProviders(<OtpLayout />);

    expect(screen.getByText("Verify OTP")).toBeTruthy();
    expect(screen.getByText("Verify & Continue")).toBeTruthy();
    expect(screen.queryByText("No Internet Connection")).toBeNull();
  });
});
