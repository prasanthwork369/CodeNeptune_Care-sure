// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    // TS-only rules
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      // Disallow explicit any type
      "@typescript-eslint/no-explicit-any": "warn",
      // Allow require() imports
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    // Disable display name rule for test mocks
    files: ["__tests__/**", "jest.setup.ts"],
    rules: {
      "react/display-name": "off",
    },
  },
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "react-native",
              importNames: ["TouchableOpacity"],
              message:
                "Use Touchable from '@/src/components/ui/Touchable' to prevent double-tap issues.",
            },
            {
              name: "expo-router",
              importNames: ["useRouter"],
              message:
                "Use useNav from '@/src/hooks/useNav' to prevent duplicate navigation pushes.",
            },
          ],
        },
      ],
    },
  },
]);
