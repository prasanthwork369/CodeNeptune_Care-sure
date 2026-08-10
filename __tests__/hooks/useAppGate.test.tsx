import { renderWithProviders } from "@/__tests__/test-utils/renderWithProviders";
import { useAppGate } from "@/src/hooks/ui/useAppGate";
import React from "react";
import { Text } from "react-native";

// The hook's only input is the settings query, so that is what we control.
const mockUseSettings = jest.fn();
jest.mock("@/src/hooks/queries/useSettings", () => ({
  useSettings: () => mockUseSettings(),
}));

jest.mock("expo-application", () => ({ nativeApplicationVersion: "1.0.0" }));

const Probe = () => {
  const { reason, maintenanceMessage } = useAppGate();
  return <Text>{`${reason ?? "open"}|${maintenanceMessage ?? ""}`}</Text>;
};

const renderWith = (data: unknown) => {
  mockUseSettings.mockReturnValue({ data });
  return renderWithProviders(<Probe />);
};

describe("useAppGate", () => {
  beforeEach(() => jest.clearAllMocks());

  it("blocks when the installed build is below the required version", () => {
    expect(
      renderWith({ minSupportedVersion: "2.0.0" }).getByText(/^update\|/),
    ).toBeTruthy();
  });

  it("blocks on maintenance and carries the message through", () => {
    expect(
      renderWith({
        maintenanceMode: true,
        maintenanceMessage: "Back at 3 PM",
      }).getByText("maintenance|Back at 3 PM"),
    ).toBeTruthy();
  });

  it("prefers maintenance over an update when both are set", () => {
    expect(
      renderWith({
        maintenanceMode: true,
        minSupportedVersion: "2.0.0",
      }).getByText(/^maintenance\|/),
    ).toBeTruthy();
  });

  // Everything below is the fail-open contract: shipping ahead of the backend
  // must never lock a user out of a pharmacy app.
  it("stays open when the backend sends nothing (today's state)", () => {
    expect(renderWith(undefined).getByText("open|")).toBeTruthy();
    expect(renderWith({}).getByText("open|")).toBeTruthy();
  });

  it("stays open when the installed build already meets the minimum", () => {
    expect(
      renderWith({ minSupportedVersion: "1.0.0" }).getByText("open|"),
    ).toBeTruthy();
  });

  it("stays open when maintenanceMode is not an explicit true", () => {
    expect(renderWith({ maintenanceMode: false }).getByText("open|")).toBeTruthy();
  });

  it("stays open on an unparseable minimum version", () => {
    expect(
      renderWith({ minSupportedVersion: "v2.0.0" }).getByText("open|"),
    ).toBeTruthy();
  });
});
