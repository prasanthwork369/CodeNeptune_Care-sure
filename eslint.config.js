// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    // TS-only: the @typescript-eslint plugin is registered for these files only,
    // so applying its rules globally crashes ESLint on plain .js files.
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      // CLAUDE.md rule: no `any`. tsconfig's `strict` only bans implicit ones,
      // so this catches the explicit ones it lets through.
      "@typescript-eslint/no-explicit-any": "warn",
      // require() is the deliberate pattern for lazy native-module loads (kept
      // out of Expo Go) and for static asset refs, so the ESM rule doesn't fit.
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    // Mock components in tests are throwaway stand-ins, not real components.
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
