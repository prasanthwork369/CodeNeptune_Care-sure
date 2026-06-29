import React from "react";
import * as RN from "react-native";
// Deep import: the metro resolver special-cases requests originating from this file
// so this resolves to the real, unpatched Text component instead of looping back here.
import OriginalTextImport from "react-native/Libraries/Text/Text";

const OriginalText = OriginalTextImport as unknown as typeof RN.Text;

// Maps numeric/keyword font weights to the Inter font family loaded via
// @expo-google-fonts/inter (see app/_layout.tsx useFonts call). Android's
// system font (Roboto) does not render numeric fontWeight reliably, so we
// render Inter there instead; iOS keeps the native SF Pro system font.
const ANDROID_WEIGHT_TO_INTER_FAMILY: Record<string, string> = {
  "100": "Inter_100Thin",
  thin: "Inter_100Thin",
  "200": "Inter_200ExtraLight",
  extralight: "Inter_200ExtraLight",
  "300": "Inter_300Light",
  light: "Inter_300Light",
  "400": "Inter_400Regular",
  normal: "Inter_400Regular",
  "500": "Inter_500Medium",
  medium: "Inter_500Medium",
  "600": "Inter_600SemiBold",
  semibold: "Inter_600SemiBold",
  "700": "Inter_700Bold",
  bold: "Inter_700Bold",
  "800": "Inter_800ExtraBold",
  extrabold: "Inter_800ExtraBold",
  "900": "Inter_900Black",
  black: "Inter_900Black",
};

/**
 * Helper to sanitize styles passed to the Text component globally:
 * 1. Flattens style array/objects.
 * 2. Identifies and strips out legacy custom fontFamily declarations (like 'Inter-Bold').
 * 3. Maps legacy font families to native numeric fontWeight properties to preserve bolding.
 * 4. For Android: maps numeric font weights to the loaded Inter font family, since
 *    Android's default system font does not support numeric fontWeight dynamically.
 * 5. Leaves fontFamily untouched on iOS so it falls back to the native SF Pro system font.
 */
function sanitizeStyle(styleProp: any): any {
  if (!styleProp) return {};

  const flattened = RN.StyleSheet.flatten(styleProp);
  if (!flattened) return {};

  const cleanStyle = { ...flattened };

  // 1. Extract font weight from legacy 'Inter' font family if present
  if (cleanStyle.fontFamily && typeof cleanStyle.fontFamily === "string") {
    const family = cleanStyle.fontFamily.toLowerCase();
    if (family.includes("inter")) {
      if (!cleanStyle.fontWeight) {
        if (family.includes("thin") || family.includes("100")) {
          cleanStyle.fontWeight = "100";
        } else if (family.includes("extralight") || family.includes("200")) {
          cleanStyle.fontWeight = "200";
        } else if (family.includes("light") || family.includes("300")) {
          cleanStyle.fontWeight = "300";
        } else if (family.includes("medium") || family.includes("500")) {
          cleanStyle.fontWeight = "500";
        } else if (family.includes("semibold") || family.includes("600")) {
          cleanStyle.fontWeight = "600";
        } else if (family.includes("extrabold") || family.includes("800")) {
          cleanStyle.fontWeight = "800";
        } else if (family.includes("bold") || family.includes("700")) {
          cleanStyle.fontWeight = "700";
        } else if (family.includes("black") || family.includes("900")) {
          cleanStyle.fontWeight = "900";
        } else {
          cleanStyle.fontWeight = "400";
        }
      }
      cleanStyle.fontFamily = undefined;
    }
  }

  // 2. Android: render Inter instead of the system font so numeric weights apply correctly
  if (RN.Platform.OS === "android") {
    const weight = cleanStyle.fontWeight?.toString() ?? "400";
    cleanStyle.fontFamily =
      ANDROID_WEIGHT_TO_INTER_FAMILY[weight] ?? "Inter_400Regular";
    cleanStyle.fontWeight = "normal";
  }

  return cleanStyle;
}

// Create a patched Text component that replaces the default react-native Text
const PatchedText = React.forwardRef<RN.Text, RN.TextProps>((props, ref) => {
  const sanitizedStyle = sanitizeStyle(props.style);
  return React.createElement(OriginalText, {
    ...props,
    ref,
    // Font sizes are already deliberately scaled per-device by moderateScale()/
    // exactScale() against the Figma baseline — letting the OS *also* apply its
    // own font-scale multiplier on top stacks two independent scaling systems
    // and makes text size unpredictable across devices. Keep this the single
    // source of truth instead.
    allowFontScaling: false,
    style: [
      { fontFamily: undefined, includeFontPadding: false }, // Default reset
      sanitizedStyle,
    ],
  });
});

// @ts-ignore
PatchedText.displayName = "Text";
// @ts-ignore
PatchedText.isPatched = true;

// Overwrite the property in react-native module exports
try {
  Object.defineProperty(RN, "Text", {
    get() {
      return PatchedText;
    },
    configurable: true,
    enumerable: true,
  });
} catch (e) {
  try {
    // @ts-ignore
    RN.Text = PatchedText;
  } catch (err) {
    console.error("Failed to globally patch react-native Text component:", err);
  }
}

// @ts-ignore
PatchedText.default = PatchedText;
// @ts-ignore
module.exports = PatchedText;
export default PatchedText;
