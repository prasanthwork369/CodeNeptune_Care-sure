import { Dimensions } from "react-native";

const { width } = Dimensions.get("window");

const FIGMA_WIDTH = 390;

export const exactScale = (size: number) => {
  "worklet";
  const scale = width / FIGMA_WIDTH;

  return size * Math.min(scale, 1.15);
};

export const moderateScale = (size: number, factor = 0.5) => {
  "worklet";
  const scale = width / FIGMA_WIDTH;
  const scaled = size * Math.min(scale, 1.15);
  return size + (scaled - size) * factor;
};
