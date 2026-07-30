import { SplashAnimationScreen } from "@/src/components/splash/SplashAnimationScreen";
import { act, render } from "@testing-library/react-native";
import React from "react";
import { AccessibilityInfo } from "react-native";

describe("SplashAnimationScreen", () => {
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

  it("shows the CareSure identity and waits for app readiness", async () => {
    const onComplete = jest.fn();
    const screen = render(
      <SplashAnimationScreen isAppReady={false} onComplete={onComplete} />,
    );

    expect(screen.getByText("CareSure")).toBeTruthy();
    expect(screen.getByText("Healthcare, delivered with care.")).toBeTruthy();

    await act(async () => Promise.resolve());
    act(() => jest.advanceTimersByTime(1_450));
    expect(onComplete).not.toHaveBeenCalled();

    screen.rerender(
      <SplashAnimationScreen isAppReady onComplete={onComplete} />,
    );
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("reveals calm loading feedback only on a slow launch", async () => {
    const screen = render(
      <SplashAnimationScreen isAppReady={false} onComplete={jest.fn()} />,
    );

    await act(async () => Promise.resolve());
    expect(screen.queryByText("Getting everything ready…")).toBeNull();

    act(() => jest.advanceTimersByTime(1_800));
    expect(screen.getByText("Getting everything ready…")).toBeTruthy();
  });

  it("honours reduced motion and uses the shorter launch duration", async () => {
    jest
      .spyOn(AccessibilityInfo, "isReduceMotionEnabled")
      .mockResolvedValue(true);
    const onComplete = jest.fn();

    render(<SplashAnimationScreen isAppReady onComplete={onComplete} />);
    await act(async () => Promise.resolve());
    act(() => jest.advanceTimersByTime(449));
    expect(onComplete).not.toHaveBeenCalled();

    act(() => jest.advanceTimersByTime(1));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
