const mockNative = {
  checkUpdateAvailability: jest.fn(),
  startFlexibleUpdate: jest.fn(),
  startImmediateUpdate: jest.fn(),
  completeFlexibleUpdate: jest.fn(),
};

let mockPlatform = "android";

jest.mock("react-native", () => ({
  get Platform() {
    return { OS: mockPlatform };
  },
  NativeModules: { InAppUpdate: mockNative },
  NativeEventEmitter: class {
    addListener() {
      return { remove: jest.fn() };
    }
  },
}));

// jest.resetModules() below re-triggers expo's fetch polyfill, which pulls in
// expo-modules-core's native view registry and, with it, nativewind's
// css-interop — which reads Appearance/AppState/AccessibilityInfo from the
// real "react-native" at import time. This test's minimal react-native mock
// above doesn't provide those, and this test has nothing to do with styling,
// so just no-op the whole styling runtime instead of reconstructing RN's API.
jest.mock("react-native-css-interop", () => ({}));
jest.mock("react-native-css-interop/jsx-runtime", () => require("react/jsx-runtime"));

const load = () => require("@/src/modules/InAppUpdate");

describe("InAppUpdate wrapper", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    mockPlatform = "android";
  });

  describe("platform safety", () => {
    it("reports unsupported on iOS and never touches the native module", async () => {
      mockPlatform = "ios";
      const m = load();

      expect(m.isInAppUpdateSupported()).toBe(false);
      expect(await m.startImmediateUpdate()).toBe("unavailable");
      expect(await m.startFlexibleUpdate()).toBe("unavailable");
      expect(await m.completeFlexibleUpdate()).toBe(false);
      expect((await m.checkUpdateAvailability()).available).toBe(false);
      expect(mockNative.startImmediateUpdate).not.toHaveBeenCalled();
    });

    it("returns a no-op unsubscribe on iOS so cleanup needs no branch", () => {
      mockPlatform = "ios";
      const m = load();
      expect(() => m.addInstallStateListener(jest.fn())()).not.toThrow();
    });
  });

  describe("android", () => {
    it("passes the native availability payload through", async () => {
      mockNative.checkUpdateAvailability.mockResolvedValue({
        available: true,
        immediateInProgress: false,
        flexibleAllowed: true,
        immediateAllowed: true,
        installStatus: "unknown",
      });

      const info = await load().checkUpdateAvailability();

      expect(info.available).toBe(true);
      expect(info.flexibleAllowed).toBe(true);
    });

    // A rejected bridge call must not surface as an unhandled rejection — the
    // caller has to be able to fall back to the store link.
    it("degrades to unavailable when the native check throws", async () => {
      mockNative.checkUpdateAvailability.mockRejectedValue(new Error("no play"));

      const info = await load().checkUpdateAvailability();

      expect(info.available).toBe(false);
      expect(info.installStatus).toBe("unknown");
    });

    it("degrades to failed when starting a flow throws", async () => {
      mockNative.startImmediateUpdate.mockRejectedValue(new Error("boom"));
      mockNative.startFlexibleUpdate.mockRejectedValue(new Error("boom"));
      const m = load();

      expect(await m.startImmediateUpdate()).toBe("failed");
      expect(await m.startFlexibleUpdate()).toBe("failed");
    });

    it("relays the native flow result verbatim", async () => {
      mockNative.startFlexibleUpdate.mockResolvedValue("in_progress");
      expect(await load().startFlexibleUpdate()).toBe("in_progress");
    });
  });

  it("reports unsupported when the native module is absent", async () => {
    jest.resetModules();
    jest.doMock("react-native", () => ({
      Platform: { OS: "android" },
      NativeModules: {},
      NativeEventEmitter: class {},
    }));
    const m = require("@/src/modules/InAppUpdate");

    expect(m.isInAppUpdateSupported()).toBe(false);
    expect(await m.startImmediateUpdate()).toBe("unavailable");
  });
});
