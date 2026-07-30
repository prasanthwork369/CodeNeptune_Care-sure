import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/inter";
import { Platform } from "react-native";

// Inter is only rendered on Android (see src/utils/patchText.ts); iOS stays on
// the native SF Pro system font and never needs these font files loaded.
// Only the weights the app actually uses are loaded — the unused Thin/ExtraLight/
// Light/Black files are dropped to cut startup font parsing (patchText remaps
// those weights to the nearest loaded family).
export function useAndroidInterFonts() {
  const [loaded] = useFonts(
    Platform.OS === "android"
      ? {
          Inter_400Regular,
          Inter_500Medium,
          Inter_600SemiBold,
          Inter_700Bold,
          Inter_800ExtraBold,
        }
      : {},
  );
  return loaded;
}
