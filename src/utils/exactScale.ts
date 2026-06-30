import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

const FIGMA_WIDTH = 390;
const FIGMA_HEIGHT = 844;

export const scale = (size: number) => {
  "worklet";
  return (width / FIGMA_WIDTH) * size;
};

export const exactScale = (size: number) => {
  "worklet";
  return scale(size);
};

export const verticalScale = (size: number) => {
  "worklet";
  return (height / FIGMA_HEIGHT) * size;
};

export const moderateScale = (
  size: number,
  factor = 0.5
) => {
  "worklet";

  const scaled = scale(size);

  return size + (scaled - size) * factor;
};