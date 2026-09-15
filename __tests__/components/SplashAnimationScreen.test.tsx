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

  it("calls onComplete immediately on mount if app is already ready", () => {
    const onComplete = jest.fn();
    render(<SplashAnimationScreen isAppReady onComplete={onComplete} />);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("renders accessible brand elements and tagline", () => {
    const screen = render(
      <SplashAnimationScreen isAppReady={false} onComplete={jest.fn()} />,
    );

    expect(screen.getByTestId("splash-screen")).toBeTruthy();
    expect(screen.getByText("CareSure")).toBeTruthy();
    expect(screen.getByText("Healthcare, delivered with care.")).toBeTruthy();
  });
});
