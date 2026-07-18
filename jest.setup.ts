/**
 * Global Jest setup. Mocks native modules that have no JS implementation in the
 * Node test environment. Test-only — never bundled into the app.
 */

// AsyncStorage: official in-memory mock (used by persisted Zustand stores).
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

// Reanimated: official mock (avoids native worklet runtime in tests).
jest.mock("react-native-reanimated", () => {
  try {
    return require("react-native-reanimated/mock");
  } catch {
    return {};
  }
});

// Firebase native modules — no-op so imports don't hit the native bridge.
jest.mock("@react-native-firebase/app", () => ({ __esModule: true, default: () => ({}) }));
jest.mock("@react-native-firebase/crashlytics", () => ({ __esModule: true, default: () => ({}) }));
jest.mock("@react-native-firebase/perf", () => ({ __esModule: true, default: () => ({}) }));
jest.mock("@react-native-firebase/messaging", () => ({ __esModule: true, default: () => ({}) }));

// Silence noisy RN warnings that don't affect assertions.
jest.spyOn(console, "warn").mockImplementation(() => {});
