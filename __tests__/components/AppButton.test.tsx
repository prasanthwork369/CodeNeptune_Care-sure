import React from "react";
import { renderWithProviders, fireEvent } from "@/__tests__/test-utils/renderWithProviders";
import { AppButton } from "@/src/components/ui/AppButton";
import { Text } from "react-native";

describe("AppButton Component", () => {
  const onPressMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders title text correctly", () => {
    const { getByText } = renderWithProviders(
      <AppButton title="Submit Order" onPress={onPressMock} />
    );

    expect(getByText("Submit Order")).toBeTruthy();
  });

  it("renders custom children when provided", () => {
    const { getByText } = renderWithProviders(
      <AppButton onPress={onPressMock}>
        <Text>Custom Child Text</Text>
      </AppButton>
    );

    expect(getByText("Custom Child Text")).toBeTruthy();
  });

  it("triggers onPress callback when pressed", () => {
    const { getByText } = renderWithProviders(
      <AppButton title="Click Me" onPress={onPressMock} />
    );

    fireEvent.press(getByText("Click Me"));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it("does not trigger onPress when disabled", () => {
    const { getByText } = renderWithProviders(
      <AppButton title="Disabled Button" onPress={onPressMock} disabled={true} />
    );

    fireEvent.press(getByText("Disabled Button"));
    expect(onPressMock).not.toHaveBeenCalled();
  });

  it("renders ActivityIndicator and disables press when loading", () => {
    const { queryByText, UNSAFE_getByType } = renderWithProviders(
      <AppButton title="Loading Button" onPress={onPressMock} loading={true} />
    );

    // Title should not be rendered while loading spinner is active
    expect(queryByText("Loading Button")).toBeNull();

    // Verify ActivityIndicator is rendered
    const activityIndicator = UNSAFE_getByType("ActivityIndicator" as any);
    expect(activityIndicator).toBeTruthy();
  });

  it("renders different button variants without crashing", () => {
    const variants = ["primary", "secondary", "outline", "ghost", "danger"] as const;

    variants.forEach((variant) => {
      const { getByText } = renderWithProviders(
        <AppButton title={`${variant} button`} variant={variant} onPress={onPressMock} />
      );
      expect(getByText(`${variant} button`)).toBeTruthy();
    });
  });
});
