import {
  renderWithProviders,
  act,
  fireEvent,
} from "@/__tests__/test-utils/renderWithProviders";
import { useSoftUpdate } from "@/src/hooks/ui/useSoftUpdate";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import { Text } from "react-native";

const mockUseSettings = jest.fn();
jest.mock("@/src/hooks/queries/useSettings", () => ({
  useSettings: () => mockUseSettings(),
}));

jest.mock("expo-application", () => ({ nativeApplicationVersion: "1.0.0" }));

const Probe = () => {
  const { shouldPrompt, latestVersion, dismiss } = useSoftUpdate();
  return (
    <Text onPress={dismiss}>{`${shouldPrompt ? "prompt" : "quiet"}|${latestVersion ?? ""}`}</Text>
  );
};

const renderWith = async (data: unknown) => {
  mockUseSettings.mockReturnValue({ data });
  const screen = renderWithProviders(<Probe />);
  // Let the AsyncStorage read resolve before asserting.
  await act(async () => {});
  return screen;
};

describe("useSoftUpdate", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
  });

  it("prompts when a newer version is published", async () => {
    const screen = await renderWith({ latestVersion: "1.4.0" });
    expect(screen.getByText("prompt|1.4.0")).toBeTruthy();
  });

  it("stays quiet once that version has been dismissed", async () => {
    const screen = await renderWith({ latestVersion: "1.4.0" });

    await act(async () => {
      fireEvent.press(screen.getByText("prompt|1.4.0"));
    });

    expect(screen.getByText("quiet|1.4.0")).toBeTruthy();
    expect(await AsyncStorage.getItem("@caresure:soft_update_dismissed_version"))
      .toBe("1.4.0");
  });

  // Dismissal is per version, not permanent — the next release must ask again.
  it("asks again when a newer version than the dismissed one ships", async () => {
    await AsyncStorage.setItem(
      "@caresure:soft_update_dismissed_version",
      "1.4.0",
    );
    const screen = await renderWith({ latestVersion: "1.5.0" });
    expect(screen.getByText("prompt|1.5.0")).toBeTruthy();
  });

  it("stays quiet for a version already dismissed on a previous launch", async () => {
    await AsyncStorage.setItem(
      "@caresure:soft_update_dismissed_version",
      "1.4.0",
    );
    const screen = await renderWith({ latestVersion: "1.4.0" });
    expect(screen.getByText("quiet|1.4.0")).toBeTruthy();
  });

  it("stays quiet when the backend sends nothing", async () => {
    expect((await renderWith(undefined)).getByText("quiet|")).toBeTruthy();
    expect((await renderWith({})).getByText("quiet|")).toBeTruthy();
  });

  it("stays quiet when already on the newest version", async () => {
    const screen = await renderWith({ latestVersion: "1.0.0" });
    expect(screen.getByText("quiet|1.0.0")).toBeTruthy();
  });
});
