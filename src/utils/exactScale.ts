import { Dimensions } from "react-native";

const { width } = Dimensions.get("window");

const FIGMA_WIDTH = 390;

export const exactScale = (size: number) => {
  "worklet";
  const scale = width / FIGMA_WIDTH;

  return size * Math.min(scale, 1.15);
};
