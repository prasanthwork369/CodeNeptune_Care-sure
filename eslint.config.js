// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    rules: {
      // CLAUDE.md rule: no `any`. tsconfig's `strict` only bans implicit ones,
      // so this catches the explicit ones it lets through.
      "@typescript-eslint/no-explicit-any": "warn",
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
