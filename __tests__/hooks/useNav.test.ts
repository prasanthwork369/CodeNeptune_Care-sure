import { renderHook } from "@testing-library/react-native";
import { useNav } from "@/src/hooks/useNav";

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  canGoBack: jest.fn(),
};

const mockNavigation = {
  isFocused: jest.fn(() => true),
};

jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
}));

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => mockNavigation,
}));

describe("useNav safe back navigation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigation.isFocused.mockReturnValue(true);
  });

  it("uses normal back navigation when history exists", () => {
    mockRouter.canGoBack.mockReturnValue(true);
    const { result } = renderHook(() => useNav());

    result.current.back();

    expect(mockRouter.back).toHaveBeenCalledTimes(1);
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  it("replaces an orphaned deep-link route with Home", () => {
    mockRouter.canGoBack.mockReturnValue(false);
    const { result } = renderHook(() => useNav());

    result.current.back();

    expect(mockRouter.back).not.toHaveBeenCalled();
    expect(mockRouter.replace).toHaveBeenCalledWith("/(tabs)");
  });

  it("exposes the current back-history state without causing navigation", () => {
    mockRouter.canGoBack.mockReturnValue(false);
    const { result } = renderHook(() => useNav());

    expect(result.current.canGoBack()).toBe(false);
    expect(mockRouter.back).not.toHaveBeenCalled();
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });
});
