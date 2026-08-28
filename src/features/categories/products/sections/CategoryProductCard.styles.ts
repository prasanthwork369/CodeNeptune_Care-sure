import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const CARD_BTN_W = exactScale(90);
export const CARD_BTN_H = exactScale(36);
export const CARD_BTN_SW = exactScale(28);

export const styles = StyleSheet.create({
  cardRoot: {
    marginBottom: exactScale(20),
  },
  imageTouchable: {
    backgroundColor: "#FFFFFF",
    borderRadius: exactScale(14),
    borderWidth: 0.77,
    borderColor: "#919EAB33",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  imageInner: {
    width: "78%",
    height: "68%",
    alignItems: "center",
    justifyContent: "center",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  btnCornerWrap: {
    position: "absolute",
    bottom: exactScale(10),
    right: exactScale(10),
  },
  addBtn: {
    width: CARD_BTN_W,
    height: CARD_BTN_H,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#0F7635",
    borderRadius: exactScale(4),
    alignItems: "center",
    justifyContent: "center",
  },
  addText: {
    fontFamily: "Inter-Bold",
    fontWeight: "700",
    color: "#0F7635",
    fontSize: moderateScale(14),
  },
  activeBtnRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0F7635",
    borderRadius: exactScale(10),
    overflow: "hidden",
    width: CARD_BTN_W,
    height: CARD_BTN_H,
  },
  counterBtn: {
    width: CARD_BTN_SW,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  plusMinus: {
    fontFamily: "Inter-Medium",
    fontWeight: "500",
    color: "#FFFFFF",
    fontSize: moderateScale(20),
    lineHeight: moderateScale(22),
  },
  plus: {
    fontFamily: "Inter-Medium",
    fontWeight: "500",
    color: "#FFFFFF",
    fontSize: moderateScale(18),
    lineHeight: moderateScale(22),
  },
  countValWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  countVal: {
    fontFamily: "Inter-Bold",
    fontWeight: "700",
    color: "#FFFFFF",
    fontSize: moderateScale(14),
    textAlign: "center",
  },
  infoContainer: {
    marginTop: exactScale(14),
  },
  pricingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: exactScale(8),
    marginBottom: exactScale(12),
  },
  priceBadge: {
    backgroundColor: "#349638",
    borderRadius: exactScale(8),
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderLeftColor: "#113D24",
    borderBottomColor: "#113D24",
    borderTopWidth: 0,
    borderRightWidth: 0,
    paddingHorizontal: exactScale(4),
    paddingVertical: exactScale(6),
  },
  price: {
    fontFamily: "Inter-Bold",
    fontWeight: "700",
    color: "#FFFFFF",
    fontSize: moderateScale(13),
  },
  mrp: {
    fontFamily: "Inter-Medium",
    fontWeight: "500",
    color: "#919EAB",
    fontSize: moderateScale(13),
    textDecorationLine: "line-through",
  },
  discountGrad: {
    borderRadius: exactScale(4),
    overflow: "hidden",
    position: "relative",
  },
  discountInner: {
    alignSelf: "flex-start",
    paddingHorizontal: exactScale(2),
    paddingVertical: exactScale(4),
  },
  discount: {
    fontFamily: "Inter-Bold",
    fontWeight: "700",
    fontSize: moderateScale(12),
    color: "#0F7635",
    lineHeight: moderateScale(12),
    padding: exactScale(4),
  },
  name: {
    fontFamily: "Inter-SemiBold",
    fontWeight: "600",
    fontSize: moderateScale(14),
    color: "#1A1C1E",
    lineHeight: moderateScale(19),
    marginBottom: exactScale(8),
  },
  desc: {
    fontFamily: "Inter-Medium",
    fontWeight: "500",
    fontSize: moderateScale(12),
    color: "#6A6A6A",
    marginBottom: exactScale(4),
  },
});
