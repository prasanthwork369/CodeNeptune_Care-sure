import { Easing } from "react-native-reanimated";

export const DURATIONS = {
  fast: 150,
  normal: 200,
  slow: 300,
  realtime: 200,
  fade: 150,
};

export const EASINGS = {
  out: Easing.out(Easing.exp),
  inOut: Easing.inOut(Easing.quad),
  standard: Easing.bezier(0.4, 0, 0.2, 1),
};
