import { HomeSearchCycler } from "@/src/features/home/sections/HomeSearchCycler";
import { act, render } from "@testing-library/react-native";
import React from "react";
import { AccessibilityInfo } from "react-native";

jest.mock("@react-navigation/native", () => ({
  useIsFocused: () => true,
}));

describe("HomeSearchCycler", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest
      .spyOn(AccessibilityInfo, "isReduceMotionEnabled")
      .mockResolvedValue(false);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("rotates one complete suggestion per interval", async () => {
    const screen = render(<HomeSearchCycler />);
    await act(async () => Promise.resolve());

    expect(screen.getByText('"Paracetamol"')).toBeTruthy();

    act(() => jest.advanceTimersByTime(3_000));
    expect(screen.getByText('"Vitamin D3"')).toBeTruthy();
  });

  it("keeps a stable suggestion when reduced motion is enabled", async () => {
    jest
      .spyOn(AccessibilityInfo, "isReduceMotionEnabled")
      .mockResolvedValue(true);
    const screen = render(<HomeSearchCycler />);
    await act(async () => Promise.resolve());

    act(() => jest.advanceTimersByTime(9_000));
    expect(screen.getByText('"Paracetamol"')).toBeTruthy();
    expect(screen.queryByText('"Vitamin D3"')).toBeNull();
  });
});
