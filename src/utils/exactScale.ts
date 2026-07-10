import { Dimensions, PixelRatio } from "react-native";

const BASE_WIDTH = 430; // Figma design baseline
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const widthRatio = SCREEN_WIDTH / BASE_WIDTH;
const pixelRatio = PixelRatio.get();

// Snap a logical-pixel value to the nearest physical pixel boundary.
const snap = (n: number) => Math.round(n * pixelRatio) / pixelRatio;

// Scales proportionally to screen width, capped at 115% to avoid runaway
// growth on tablets. Replaces the old pixel-snap-only implementation so that
// all values already wrapped in exactScale/moderateScale adapt to device width.
export const scale = (size: number) => {
  "worklet";
  return snap(size * widthRatio);
};

export const exactScale = (size: number) => {
  "worklet";
  return snap(size * Math.min(widthRatio, 1.15));
};

export const verticalScale = (size: number) => {
  "worklet";
  return snap(size * widthRatio);
};

// Scales more gently than exactScale — fonts shrink/grow less than layout.
// factor=0 → no scaling; factor=1 → full exactScale; default 0.5 → halfway.
export const moderateScale = (size: number, factor = 0.5) => {
  "worklet";
  const scaled = snap(size * Math.min(widthRatio, 1.15));
  return snap(size + (scaled - size) * factor);
};
