import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

// CategoryProductCard
export const CARD_BTN_W = exactScale(90);
export const CARD_BTN_H = exactScale(36);
export const CARD_BTN_SW = exactScale(28);

export const categoryCardStyles = StyleSheet.create({
  addText: { color: "#0F7635", fontSize: moderateScale(14), fontWeight: "700" },
  plusMinus: {
    color: "#FFFFFF",
    fontSize: moderateScale(20),
    fontWeight: "500",
    lineHeight: moderateScale(22),
  },
  plus: {
    color: "#FFFFFF",
    fontSize: moderateScale(18),
    fontWeight: "500",
    lineHeight: moderateScale(22),
  },
  countVal: {
    color: "#FFFFFF",
    fontSize: moderateScale(14),
    fontWeight: "700",
  },
  price: { color: "#FFFFFF", fontSize: moderateScale(13), fontWeight: "700" },
  mrp: {
    color: "#919EAB",
    fontSize: moderateScale(13),
    fontWeight: "500",
    textDecorationLine: "line-through",
  },
  name: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#1A1C1E",
    lineHeight: moderateScale(19),
  },
  desc: { fontSize: moderateScale(12), fontWeight: "500", color: "#6A6A6A" },
  discount: {
    fontSize: moderateScale(12),
    fontWeight: "700",
    color: "#0F7635",
    lineHeight: moderateScale(12),
    padding: 4,
  },
});

// CategoriesSidebar
export const sidebarStyles = StyleSheet.create({
  icon: { width: exactScale(28), height: exactScale(28) },
  iconWrap: { width: exactScale(40), height: exactScale(40) },
  label: { fontSize: moderateScale(12) },
});

// CategoriesGrid
export const CARD_WIDTH = exactScale(124);
export const CARD_HEIGHT = exactScale(110);
export const GRID_GAP = exactScale(12);
export const GRID_PADDING = exactScale(10);
export const CARD_RADIUS = exactScale(10);

export const CARD_IMAGE_WIDTH = exactScale(91.34);
export const CARD_IMAGE_HEIGHT = exactScale(82.02);
export const CARD_IMAGE_LEFT = exactScale(35);

export const gridStyles = StyleSheet.create({
  cardLabel: {
    fontSize: moderateScale(12),
    lineHeight: moderateScale(18),
    letterSpacing: 0,
  },
  card: { borderRadius: CARD_RADIUS, overflow: "hidden", position: "relative" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: GRID_GAP },
  column: { gap: GRID_GAP },
  row: { flexDirection: "row", gap: GRID_GAP },
  cardImage: {
    position: "absolute",
    bottom: exactScale(-8),
    left: CARD_IMAGE_LEFT,
    width: CARD_IMAGE_WIDTH,
    height: CARD_IMAGE_HEIGHT,
    opacity: 1,
  },
});
