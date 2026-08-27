import React from "react";
import { screen } from "@testing-library/react-native";
import { renderWithProviders } from "@/__tests__/test-utils/renderWithProviders";
import { LoginLayout } from "@/src/features/auth/screens/LoginLayout";
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

jest.mock("@/src/features/auth/hooks/useLogin", () => ({
  useLogin: () => ({
    phoneNumber: "9876543210",
    phoneError: "",
    loading: false,
    error: null,
    isValid: true,
    phoneInputRef: { current: null },
    hintShieldVisible: false,
    handleChangeText: jest.fn(),
    handleHintPress: jest.fn(),
    handleGetOtp: jest.fn(),
    handleSubmitEditing: jest.fn(),
  }),
}));

jest.mock("@/src/store/authStore", () => ({
  useAuthStore: {
    getState: () => ({ isGuest: false }),
  },
}));

jest.mock("expo-router", () => ({
  useFocusEffect: (cb: () => void) => cb(),
  useIsFocused: () => true,
}));

describe("LoginLayout Offline State", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders full-screen NoInternetState when offline", () => {
    (useIsOffline as jest.Mock).mockReturnValue(true);

    renderWithProviders(<LoginLayout />);

    expect(screen.getByText("No Internet Connection")).toBeTruthy();
    expect(screen.getByText("Please check your network")).toBeTruthy();
    expect(screen.getByText("Try again")).toBeTruthy();
    expect(screen.queryByText("Why pay more for the same medicine?")).toBeNull();
    expect(screen.queryByText("Get OTP")).toBeNull();
  });

  it("renders login form and Get OTP button when online", () => {
    (useIsOffline as jest.Mock).mockReturnValue(false);

    renderWithProviders(<LoginLayout />);

    expect(screen.getByText("Why pay more for the same medicine?")).toBeTruthy();
    expect(screen.getByText("Get OTP")).toBeTruthy();
    expect(screen.queryByText("No Internet Connection")).toBeNull();
  });
});
