import { StyleSheet } from "react-native";
import { exactScale, moderateScale } from "@/src/utils/exactScale";

export const CART_BTN_HEIGHT = exactScale(40);
export const COUNTER_HIT = exactScale(40);

export const styles = StyleSheet.create({
  cardRoot: {
    borderRadius: exactScale(12),
    overflow: "hidden",
    backgroundColor: "transparent",
    borderWidth: 0.77,
    borderColor: "#919EAB33",
  },
  touchableMain: {
    flex: 1,
  },
  imageWrap: {
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeWrap: {
    position: "absolute",
    top: exactScale(8),
    left: exactScale(12),
    paddingHorizontal: exactScale(8),
    paddingVertical: exactScale(2),
    borderRadius: exactScale(4),
    zIndex: 10,
  },
  badgeText: {
    fontFamily: "Inter-Bold",
    fontWeight: "700",
    fontSize: moderateScale(12),
  },
  infoArea: {
    flex: 1,
    paddingHorizontal: exactScale(12),
    paddingTop: exactScale(12),
  },
  name: {
    fontFamily: "Inter-Medium",
    fontWeight: "500",
    color: "#111827",
    fontSize: moderateScale(14),
    lineHeight: moderateScale(18),
  },
  description: {
    fontFamily: "Inter-Medium",
    fontWeight: "500",
    color: "#6B7280",
    marginTop: exactScale(4),
    fontSize: moderateScale(12),
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: exactScale(6),
    marginTop: exactScale(8),
  },
  price: {
    fontFamily: "Inter-Bold",
    fontWeight: "700",
    color: "#0F172A",
    fontSize: moderateScale(16),
  },
  mrpWrap: {
    flexDirection: "row",
    alignItems: "center",
  },
  mrpLabel: {
    fontFamily: "Inter-Regular",
    fontWeight: "400",
    color: "#6B7280",
    marginRight: exactScale(4),
    fontSize: moderateScale(12),
  },
  mrpValue: {
    fontFamily: "Inter-Regular",
    fontWeight: "400",
    color: "#6B7280",
    textDecorationLine: "line-through",
    fontSize: moderateScale(12),
  },
  buttonContainer: {
    paddingHorizontal: exactScale(12),
    paddingBottom: exactScale(12),
  },
  addBtnTouchable: {
    borderRadius: exactScale(10),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    height: CART_BTN_HEIGHT,
  },
  addToCart: {
    fontFamily: "Inter-Bold",
    fontWeight: "700",
    fontSize: moderateScale(14),
  },
  cartBtnActive: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: exactScale(10),
    height: CART_BTN_HEIGHT,
  },
  counterBtn: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  counter: {
    fontFamily: "Inter-Medium",
    fontWeight: "500",
    color: "#FFFFFF",
    lineHeight: moderateScale(20),
    fontSize: moderateScale(20),
  },
  counterValWrap: {
    width: exactScale(24),
    alignItems: "center",
    justifyContent: "center",
  },
  counterVal: {
    fontFamily: "Inter-Bold",
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: moderateScale(14),
    width: exactScale(24),
  },
});
