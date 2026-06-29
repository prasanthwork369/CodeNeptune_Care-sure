import { Dimensions, PixelRatio } from "react-native";

// Read window dimensions, kept fresh via the listener below so rotation,
// foldable unfold/fold, and Android split-screen resizing are reflected in
// later scale()/verticalScale()/moderateScale() calls instead of using a stale width.
let screenWidth = Dimensions.get("window").width;
let screenHeight = Dimensions.get("window").height;

Dimensions.addEventListener("change", ({ window }) => {
  screenWidth = window.width;
  screenHeight = window.height;
});

// Figma design baseline — every exactScale()/moderateScale() call site in the
// app was authored assuming this value. Do not change it without re-tuning
// every call site; changing it silently resizes the entire app.
const guidelineBaseWidth = 390;
const guidelineBaseHeight = 680;
const pixelRatio = PixelRatio.get();

// Layout scaling rules:
//   • Baseline device (390dp wide) → rawScale = 1.0, rendered exactly as Figma.
//   • Larger phones (430dp+)       → capped at 1.0 so nothing grows beyond design.
//   • Smaller phones (<390dp)      → floored at 0.85 so nothing shrinks below 85%
//     of the design value (prevents illegibly tiny text/icons on compact devices).
// Inlined (not a shared helper) because Reanimated worklets can't synchronously
// call a plain (non-worklet) JS function on the UI thread.
export const scale = (size: number) => {
  "worklet";
  const shortDimension =
    screenWidth < screenHeight ? screenWidth : screenHeight;
  const rawScale = shortDimension / guidelineBaseWidth;
  // Max = 1.0  → never larger than Figma on big phones.
  // Min = 0.85 → never smaller than 85% on compact phones.
  const clampedScale = Math.max(0.85, Math.min(rawScale, 1.0));
  const val = clampedScale * size;
  return Math.round(val * pixelRatio) / pixelRatio;
};

export const verticalScale = (size: number) => {
  "worklet";
  const longDimension = screenWidth > screenHeight ? screenWidth : screenHeight;
  const rawScale = longDimension / guidelineBaseHeight;
  const clampedScale = Math.max(0.85, Math.min(rawScale, 1.0));
  const val = clampedScale * size;
  return Math.round(val * pixelRatio) / pixelRatio;
};

export const moderateScale = (size: number, factor = 0.5) => {
  "worklet";
  // factor = 0.5 → fonts/icons scale at 50% of the layout ratio.
  // This means a font designed at 16dp on 390dp:
  //   • 430dp phone → stays at 16dp (capped at 1.0x)
  //   • 360dp phone → ~15.1dp (proportionally smaller, not a cliff drop)
  const val = size + (scale(size) - size) * factor;
  return Math.round(val * pixelRatio) / pixelRatio;
};

// Maintain backward compatibility for components using exactScale
export const exactScale = (size: number) => {
  "worklet";
  return scale(size);
};
