import React from "react";
// Android uses loaded Inter files; iOS keeps native SF Pro.
// eslint-disable-next-line no-restricted-imports
import * as RN from "react-native";
// Metro lets this patch import the original component without recursing.
import OriginalTextImport from "react-native/Libraries/Text/Text";

const OriginalText = OriginalTextImport as unknown as typeof RN.Text;

// Only these Inter weights are loaded by useAndroidInterFonts.
const ANDROID_WEIGHT_TO_INTER_FAMILY = {
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
} as const;

// Missing lighter weights use Regular; 900/Black uses the heaviest loaded file.
const ANDROID_WEIGHT_FALLBACK: Record<string, "400" | "800"> = {
  "100": "400",
  thin: "400",
  "200": "400",
  extralight: "400",
  "300": "400",
  light: "400",
  "900": "800",
  black: "800",
};

const getAndroidInterFamily = (weight: unknown): string => {
  const requested = weight?.toString().toLowerCase() ?? "400";
  const normalized = ANDROID_WEIGHT_FALLBACK[requested] ?? requested;

  return (
    ANDROID_WEIGHT_TO_INTER_FAMILY[
      normalized as keyof typeof ANDROID_WEIGHT_TO_INTER_FAMILY
    ] ?? ANDROID_WEIGHT_TO_INTER_FAMILY["400"]
  );
};

/** Normalizes shared Text and TextInput styles for the current platform. */
export function sanitizeStyle(styleProp: any): any {
  // Never bail out early: Android must get an Inter family even with no style prop.
  const cleanStyle = { ...(RN.StyleSheet.flatten(styleProp) ?? {}) };

  // Preserve weights encoded in legacy Inter names before removing the family.
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

  // Android selects a loaded Inter file and lets that file provide the weight.
  if (RN.Platform.OS === "android") {
    cleanStyle.fontFamily = getAndroidInterFamily(cleanStyle.fontWeight);
    cleanStyle.fontWeight = "normal";
  }

  return cleanStyle;
}

const PatchedText = React.forwardRef<RN.Text, RN.TextProps>((props, ref) => {
  const sanitizedStyle = sanitizeStyle(props.style);
  return React.createElement(OriginalText, {
    ...props,
    ref,
    allowFontScaling: props.allowFontScaling ?? false,
    style: [{ includeFontPadding: false }, sanitizedStyle],
  });
});

// @ts-ignore
PatchedText.displayName = "Text";

// Preserve original statics for React Native and library compatibility.
for (const key of Object.keys(OriginalText)) {
  // @ts-ignore
  if ((PatchedText as any)[key] === undefined) {
    // @ts-ignore
    (PatchedText as any)[key] = (OriginalText as any)[key];
  }
}

try {
  Object.defineProperty(RN, "Text", {
    get() {
      return PatchedText;
    },
    configurable: true,
    enumerable: true,
  });
} catch {
  try {
    // @ts-ignore
    RN.Text = PatchedText;
  } catch (err) {
    if (__DEV__)
      console.error("Failed to globally patch react-native Text component:", err);
  }
}

// @ts-ignore
PatchedText.default = PatchedText;
// Keep sanitizeStyle available after CommonJS export replacement.
// @ts-ignore
PatchedText.sanitizeStyle = sanitizeStyle;
// @ts-ignore
module.exports = PatchedText;
export default PatchedText;
