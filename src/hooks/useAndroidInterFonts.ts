import {
  Inter_100Thin,
  Inter_200ExtraLight,
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  Inter_900Black,
  useFonts,
} from "@expo-google-fonts/inter";
import { Platform } from "react-native";

// Inter is only rendered on Android (see src/utils/patchText.ts); iOS stays on
// the native SF Pro system font and never needs these font files loaded.
export function useAndroidInterFonts() {
  const [loaded] = useFonts(
    Platform.OS === "android"
      ? {
          Inter_100Thin,
          Inter_200ExtraLight,
          Inter_300Light,
          Inter_400Regular,
          Inter_500Medium,
          Inter_600SemiBold,
          Inter_700Bold,
          Inter_800ExtraBold,
          Inter_900Black,
        }
      : {}
  );
  return loaded;
}
