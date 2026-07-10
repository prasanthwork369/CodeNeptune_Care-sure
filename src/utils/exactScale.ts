import { Dimensions, PixelRatio } from "react-native";

const BASE_WIDTH = 390; // Figma design baseline
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const widthRatio = SCREEN_WIDTH / BASE_WIDTH;
const pixelRatio = PixelRatio.get();

// Snap a logical-pixel value to the nearest physical pixel boundary.
const snap = (n: number) => Math.round(n * pixelRatio) / pixelRatio;

// LAYOUT scaling — proportional to screen width so widths/heights/padding keep
// the same visual proportion across devices. Capped at 115% to avoid runaway
// growth on tablets.
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

export const moderateScale = (size: number, factor = 0.1) => {
  "worklet";
  const scaled = snap(size * Math.min(widthRatio, 1.15));
  return snap(size + (scaled - size) * factor);
};
