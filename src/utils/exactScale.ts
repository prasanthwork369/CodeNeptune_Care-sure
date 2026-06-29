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

// Cap growth/shrink between 0.92x and 1.0x of the Figma size — never render
// LARGER than the literal Figma px value (only the 0.92x floor protects small
// phones from going illegibly tiny). Growth above 1x was what made text feel
// oversized even at the OS's default/100% text-size setting on phones wider
// than the 390px baseline. Note: this floor only affects phones NARROWER than
// 390px — phones at or above the baseline are already locked at 1.0x and
// unaffected by this number.
// Inlined (not a shared helper) because Reanimated worklets can't synchronously
// call a plain (non-worklet) JS function on the UI thread.
export const scale = (size: number) => {
  "worklet";
  const shortDimension =
    screenWidth < screenHeight ? screenWidth : screenHeight;
  const rawScale = shortDimension / guidelineBaseWidth;
  const clampedScale = Math.max(0.82, Math.min(rawScale, 1.0));
  const val = clampedScale * size;
  return Math.round(val * pixelRatio) / pixelRatio;
};

export const verticalScale = (size: number) => {
  "worklet";
  const longDimension = screenWidth > screenHeight ? screenWidth : screenHeight;
  const rawScale = longDimension / guidelineBaseHeight;
  const clampedScale = Math.max(0.82, Math.min(rawScale, 1.0));
  const val = clampedScale * size;
  return Math.round(val * pixelRatio) / pixelRatio;
};

export const moderateScale = (size: number, factor = 0.3) => {
  "worklet";
  // moderateScale uses horizontal scale as the base scale
  const val = size + (scale(size) - size) * factor;
  return Math.round(val * pixelRatio) / pixelRatio;
};

// Maintain backward compatibility for components using exactScale
export const exactScale = (size: number) => {
  "worklet";
  return scale(size);
};
