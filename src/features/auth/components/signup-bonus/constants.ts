import { HOME_IMAGES } from "@/src/constants/images";
import { exactScale } from "@/src/utils/exactScale";

export const CARD_WIDTH = exactScale(342);

export const DEFAULT_CORPORATE_BADGES = [
  {
    label: "Earn coins",
    description: "on every order",
    icon: HOME_IMAGES.walletOutlinePurple,
  },
  {
    label: "Use coins",
    description: "for discounts",
    icon: HOME_IMAGES.pillPink,
  },
  {
    label: "More benefits",
    description: "exclusive for you",
    icon: HOME_IMAGES.giftOutlineBlue,
  },
];
