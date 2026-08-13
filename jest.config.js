/**
 * Jest configuration for the CareSure Expo app.
 * Uses the jest-expo preset so Expo/React Native modules transform correctly.
 * Test-only — does not affect the production bundle.
 */
module.exports = {
  preset: "jest-expo",
  // Forces requires from/into react-native-worklets to resolve the non-native
  // build under Jest, so mocking reanimated doesn't pull in the real
  // TurboModule (which throws with no native runtime attached).
  resolver: "react-native-worklets/jest/resolver.js",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  // Path alias: imports use "@/src/..." which resolves from the project root.
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "\\.(lottie|png|jpg|jpeg|gif|webp|svg)$":
      "<rootDir>/__tests__/__mocks__/fileMock.js",
  },
  // Rely on the jest-expo preset's transformIgnorePatterns (it already handles
  // expo-modules-core and all RN/Expo packages). Extend it only if a specific
  // untranspiled dependency shows up.
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.styles.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/index.ts",
  ],
  testMatch: ["<rootDir>/__tests__/**/*.test.{ts,tsx}"],
};
