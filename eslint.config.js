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
