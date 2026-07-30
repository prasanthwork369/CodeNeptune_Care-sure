// Source of truth moved to src/theme/ — import from there in new code.
// This file re-exports everything so existing imports continue to work.
import { moderateScale } from "@/src/utils/exactScale";
import { colors, spacing } from "@/src/theme";

export { colors, spacing };

// Standard height for "Add to Cart" / "+ Add" buttons across product cards
export const CART_BUTTON_HEIGHT = moderateScale(14) * 2.8;

export const components = {
  tabBar: {
    height: spacing[18],
    horizontalInset: spacing[5],
    radius: spacing[8],
    iconFrame: spacing[12],
    itemPaddingVertical: spacing[2],
  },
} as const;

export const theme = {
  colors,
  spacing,
  components,
} as const;
