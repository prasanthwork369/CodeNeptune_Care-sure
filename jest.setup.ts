process.env.EXPO_PUBLIC_API_BASE_URL_QA = "https://qa-api.caresure.com";
process.env.EXPO_PUBLIC_API_BASE_URL_PROD = "https://api.caresure.com";

// AsyncStorage: official in-memory mock (used by persisted Zustand stores).
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

// Expo SQLite mock for Node/Jest environment
jest.mock("expo-sqlite", () => ({
  openDatabaseSync: jest.fn(() => ({
    execSync: jest.fn(),
    runSync: jest.fn(),
    getFirstSync: jest.fn(),
    getAllSync: jest.fn(() => []),
  })),
}));

// Safe area context mock
jest.mock("react-native-safe-area-context", () => {
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: ({ children }: any) => children,
    SafeAreaConsumer: ({ children }: any) => children(inset),
    SafeAreaView: ({ children }: any) => children,
    useSafeAreaInsets: () => inset,
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 390, height: 844 }),
  };
});

// React Native Modal mock for RNTL component rendering
jest.mock("react-native", () => {
  const rn = jest.requireActual("react-native");
  rn.Modal = ({ children, visible }: any) => (visible ? children : null);
  return rn;
});

// NetInfo native module mock
jest.mock("@react-native-community/netinfo", () => ({
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest
    .fn()
    .mockResolvedValue({ isConnected: true, isInternetReachable: true }),
  useNetInfo: jest
    .fn()
    .mockReturnValue({ isConnected: true, isInternetReachable: true }),
}));

// Reanimated: official mock (avoids native worklet runtime in tests).
jest.mock("react-native-reanimated", () => {
  try {
    const reanimated = require("react-native-reanimated/mock");
    return {
      ...reanimated,
      useReducedMotion: () => false,
    };
  } catch {
    return {};
  }
});

// Firebase native modules — no-op so imports don't hit the native bridge.
jest.mock("@react-native-firebase/app", () => ({
  __esModule: true,
  default: () => ({}),
}));
jest.mock("@react-native-firebase/crashlytics", () => {
  const crashInstance = {
    getCrashlytics: jest.fn(),
    setCrashlyticsCollectionEnabled: jest.fn(),
    setAttribute: jest.fn(),
    recordError: jest.fn(),
    log: jest.fn(),
  };
  const mockFn: any = jest.fn(() => crashInstance);
  mockFn.getCrashlytics = jest.fn();
  mockFn.setCrashlyticsCollectionEnabled = jest.fn();
  mockFn.setAttribute = jest.fn();
  mockFn.recordError = jest.fn();
  mockFn.log = jest.fn();
  return {
    __esModule: true,
    default: mockFn,
    getCrashlytics: jest.fn(),
    setCrashlyticsCollectionEnabled: jest.fn(),
    setAttribute: jest.fn(),
    recordError: jest.fn(),
    log: jest.fn(),
  };
});
jest.mock("@react-native-firebase/perf", () => ({
  __esModule: true,
  default: () => ({}),
}));
jest.mock("@react-native-firebase/messaging", () => ({
  __esModule: true,
  default: () => ({}),
}));

// Silence noisy RN warnings that don't affect assertions.
jest.spyOn(console, "warn").mockImplementation(() => {});
