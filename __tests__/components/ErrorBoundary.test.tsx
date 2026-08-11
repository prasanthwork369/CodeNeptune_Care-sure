import React from "react";
import { renderWithProviders } from "@/__tests__/test-utils/renderWithProviders";
import { ErrorBoundary } from "@/src/components/common/ErrorBoundary";
import { reportError } from "@/src/services/firebase";
import { Text, View } from "react-native";
import { fireEvent } from "@testing-library/react-native";

jest.mock("@/src/services/firebase", () => ({
  reportError: jest.fn(),
}));

const ThrowingComponent = () => {
  throw new Error("Render error in child component");
};

describe("ErrorBoundary Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console.error output from React during intentional boundary error throwing
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  it("renders children normally when no error occurs", () => {
    const { getByText } = renderWithProviders(
      <ErrorBoundary>
        <View>
          <Text>Normal App Component</Text>
        </View>
      </ErrorBoundary>,
    );

    expect(getByText("Normal App Component")).toBeTruthy();
    expect(reportError).not.toHaveBeenCalled();
  });

  it("catches render errors, reports to Crashlytics, and displays fallback UI", () => {
    const { getByText } = renderWithProviders(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>,
    );

    expect(getByText("Something went wrong")).toBeTruthy();
    expect(
      getByText("We could not open this screen. Please try again."),
    ).toBeTruthy();
    expect(getByText("Try Again")).toBeTruthy();
    expect(reportError).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Render error in child component" }),
      "render-error-boundary",
    );
  });

  it("renders the child again after Try Again is pressed", () => {
    const view = renderWithProviders(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>,
    );

    // Simulate the underlying screen becoming healthy while the boundary is
    // still displaying its fallback. The retry should reset only the boundary.
    view.rerender(
      <ErrorBoundary>
        <Text>Recovered App Component</Text>
      </ErrorBoundary>,
    );

    fireEvent.press(view.getByText("Try Again"));

    expect(view.getByText("Recovered App Component")).toBeTruthy();
  });
});
