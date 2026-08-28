import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const FOOTER_CONTROL_HEIGHT = exactScale(50);

export const styles = StyleSheet.create({
  stickyFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  stickyFooterContent: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: undefined,
  },
  priceBlock: {
    flex: 1,
    marginRight: exactScale(10),
    minWidth: 0,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: exactScale(4),
    flexWrap: "wrap",
  },
  priceText: {
    fontFamily: "Inter-ExtraBold",
    fontWeight: "800",
    color: "#111827",
    fontSize: moderateScale(20),
  },
  originalPriceText: {
    fontFamily: "Inter-Medium",
    fontWeight: "500",
    color: "#6B7280",
    textDecorationLine: "line-through",
    fontSize: moderateScale(12),
  },
  discountBadge: {
    paddingHorizontal: exactScale(8),
    paddingVertical: exactScale(2),
    borderRadius: exactScale(2),
    backgroundColor: "#DBE9FE",
    position: "relative",
  },
  discountText: {
    fontFamily: "Inter-Bold",
    fontWeight: "700",
    fontSize: moderateScale(12),
    color: "#0559E8",
  },
  taxesText: {
    fontFamily: "Inter-Medium",
    fontWeight: "500",
    color: "#6B7280",
    marginTop: exactScale(2),
    fontSize: moderateScale(11),
  },
  addToCartBtn: {
    flexBasis: "42%",
    minWidth: exactScale(128),
    maxWidth: exactScale(140),
    flexShrink: 0,
  },
  addToCartText: {
    fontSize: moderateScale(16),
  },
  qtyCounter: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: exactScale(10),
    backgroundColor: "#FFFFFF",
    width: "34%",
    minWidth: exactScale(100),
    maxWidth: exactScale(120),
    height: FOOTER_CONTROL_HEIGHT,
  },
  counterBtn: {
    width: exactScale(36),
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  counterBtnText: {
    color: "#0F7635",
    fontFamily: "Inter-Bold",
    fontWeight: "700",
    fontSize: moderateScale(20),
    lineHeight: moderateScale(24),
  },
  counterValueWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  counterValueText: {
    fontFamily: "Inter-Bold",
    fontWeight: "700",
    color: "#111827",
    fontSize: moderateScale(16),
  },
  viewCartWrap: {
    flex: 1,
    marginLeft: exactScale(10),
    minWidth: 0,
  },
  viewCartBtn: {
    backgroundColor: "#0F7635",
    borderRadius: exactScale(10),
    paddingHorizontal: exactScale(12),
    height: FOOTER_CONTROL_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
    overflow: "hidden",
  },
  viewCartLeftCol: {
    flexShrink: 1,
    minWidth: 0,
    marginRight: exactScale(6),
  },
  itemsCountText: {
    color: "#D1FAE5",
    fontFamily: "Inter-Medium",
    fontWeight: "500",
    fontSize: moderateScale(10),
  },
  cartPriceText: {
    color: "#FFFFFF",
    fontFamily: "Inter-Bold",
    fontWeight: "700",
    fontSize: moderateScale(14),
  },
  viewCartRightCol: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
  },
  viewCartText: {
    color: "#FFFFFF",
    fontFamily: "Inter-Bold",
    fontWeight: "700",
    fontSize: moderateScale(13),
    marginRight: exactScale(4),
  },
});
