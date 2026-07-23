import { act, renderHook } from "@testing-library/react-native";
import { useLogin } from "@/src/hooks/useLogin";
import { getPhoneNumberHint } from "@/src/modules/PhoneNumberHint";

const mockRequestOtp = jest.fn();

jest.mock("@/src/hooks/mutations/useAuth", () => ({
  useAuth: () => ({
    requestOtp: mockRequestOtp,
    loading: false,
    error: null,
  }),
}));

jest.mock("@/src/hooks/useNav", () => ({
  useNav: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn(),
  }),
}));

jest.mock("@/src/services/firebase", () => ({
  PERF_TRACES: { LOGIN_SUBMIT: "login_submit" },
  usePerformanceTrace: () => ({
    start: jest.fn(),
    stop: jest.fn(),
  }),
}));

jest.mock("@/src/modules/PhoneNumberHint", () => {
  const actual = jest.requireActual("@/src/modules/PhoneNumberHint");
  return {
    ...actual,
    getPhoneNumberHint: jest.fn(),
  };
});

describe("useLogin phone input", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("becomes valid at 10 digits and ignores appended overflow digits", () => {
    const { result } = renderHook(() => useLogin());

    for (const value of [
      "9",
      "91",
      "912",
      "9123",
      "91234",
      "912345",
      "9123456",
      "91234567",
      "912345678",
      "9123456789",
    ]) {
      act(() => result.current.handleChangeText(value));
    }

    expect(result.current.phoneNumber).toBe("9123456789");
    expect(result.current.phoneError).toBe("");
    expect(result.current.isValid).toBe(true);

    act(() => result.current.handleChangeText("91234567890"));
    act(() => result.current.handleChangeText("91234567890000"));

    expect(result.current.phoneNumber).toBe("9123456789");
    expect(result.current.phoneError).toBe("");
    expect(result.current.isValid).toBe(true);
  });

  it("returns to incomplete validation when a stored digit is deleted", () => {
    const { result } = renderHook(() => useLogin());

    act(() => result.current.handleChangeText("9876543210"));
    expect(result.current.isValid).toBe(true);

    act(() => result.current.handleChangeText("987654321"));

    expect(result.current.phoneNumber).toBe("987654321");
    expect(result.current.isValid).toBe(false);
    expect(result.current.phoneError).toBe(
      "Please enter a valid 10-digit mobile number",
    );
  });

  it("preserves sanitization for formatted and +91 pasted numbers", () => {
    const { result } = renderHook(() => useLogin());

    act(() => result.current.handleChangeText("+91 98765-43210"));

    expect(result.current.phoneNumber).toBe("9876543210");
    expect(result.current.isValid).toBe(true);
  });

  it("preserves the Google phone-number picker flow", async () => {
    (getPhoneNumberHint as jest.Mock).mockResolvedValue("+91 98765 43210");
    const { result } = renderHook(() => useLogin());

    await act(async () => {
      await result.current.handlePhoneFocus();
    });

    expect(result.current.phoneNumber).toBe("9876543210");
    expect(result.current.isValid).toBe(true);
  });
});
