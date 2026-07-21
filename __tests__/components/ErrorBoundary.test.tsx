import React from "react";
import { render } from "@testing-library/react-native";
import { ErrorBoundary } from "@/src/components/common/ErrorBoundary";
import { reportError } from "@/src/services/firebase";
import { Text, View } from "react-native";

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
    const { getByText } = render(
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
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>,
    );

    expect(getByText("Something went wrong")).toBeTruthy();
    expect(getByText("Please restart the app.")).toBeTruthy();
    expect(reportError).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Render error in child component" }),
      "render-error-boundary",
    );
  });
});
