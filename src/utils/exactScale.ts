import { PixelRatio } from "react-native";

const pixelRatio = PixelRatio.get();

// Locked to the literal Figma value on every device — no device-width-based
// scaling at all. Every screen renders pixel-identical to Figma regardless
// of device size, at the cost of possible overflow/clipping on phones
// narrower than the Figma baseline and unused space on larger screens.
export const scale = (size: number) => {
  "worklet";
  return Math.round(size * pixelRatio) / pixelRatio;
};

export const exactScale = (size: number) => {
  "worklet";
  return scale(size);
};

export const verticalScale = (size: number) => {
  "worklet";
  return Math.round(size * pixelRatio) / pixelRatio;
};

export const moderateScale = (size: number, _factor = 0.5) => {
  "worklet";
  return Math.round(size * pixelRatio) / pixelRatio;
};
