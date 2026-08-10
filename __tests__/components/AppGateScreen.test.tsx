import { renderWithProviders, fireEvent } from "@/__tests__/test-utils/renderWithProviders";
import { AppGateScreen } from "@/src/components/common/AppGateScreen";
import React from "react";
import { Linking } from "react-native";

describe("AppGateScreen", () => {
  afterEach(() => jest.restoreAllMocks());

  describe("force update", () => {
    it("shows the update copy and an action to reach the store", () => {
      const screen = renderWithProviders(<AppGateScreen reason="update" />);

      expect(screen.getByText("Update required")).toBeTruthy();
      expect(screen.getByText("Update now")).toBeTruthy();
    });

    it("opens the store when the action is pressed", () => {
      const openURL = jest
        .spyOn(Linking, "openURL")
        .mockResolvedValue(undefined as never);
      const screen = renderWithProviders(<AppGateScreen reason="update" />);

      fireEvent.press(screen.getByText("Update now"));

      expect(openURL).toHaveBeenCalledTimes(1);
      // Tests run as iOS by default, so this also guards the bug where every
      // platform was sent to Play Store — an iPhone cannot install from there.
      const url = openURL.mock.calls[0][0];
      expect(url).not.toContain("play.google.com");
      expect(url).toContain("apple.com");
    });
  });

  describe("maintenance", () => {
    it("shows the backend's message when one is supplied", () => {
      const screen = renderWithProviders(
        <AppGateScreen reason="maintenance" maintenanceMessage="Back at 3 PM" />,
      );

      expect(screen.getByText("We'll be right back")).toBeTruthy();
      expect(screen.getByText("Back at 3 PM")).toBeTruthy();
    });

    it("falls back to default copy when no message is supplied", () => {
      const screen = renderWithProviders(<AppGateScreen reason="maintenance" />);

      expect(
        screen.getByText(/scheduled maintenance/i),
      ).toBeTruthy();
    });

    // Maintenance is not the user's fault and they cannot act on it, so the
    // screen must not offer an update action that would take them to the store.
    it("offers no update action", () => {
      const screen = renderWithProviders(<AppGateScreen reason="maintenance" />);

      expect(screen.queryByText("Update now")).toBeNull();
    });
  });
});
