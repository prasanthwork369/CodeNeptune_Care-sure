import {
  FadeInDown,
  FadeOutUp,
  LinearTransition,
  ReduceMotion,
} from "react-native-reanimated";

export const SAVINGS_BANNER_ENTERING = FadeInDown.duration(220).reduceMotion(
  ReduceMotion.System,
);

export const SAVINGS_BANNER_EXITING = FadeOutUp.duration(180).reduceMotion(
  ReduceMotion.System,
);

export const CART_CONTENT_LAYOUT = LinearTransition.duration(220).reduceMotion(
  ReduceMotion.System,
);

export const SKELETON_CARD_HEIGHT = 127;
export const SKELETON_LIST_OFFSET = 260;
