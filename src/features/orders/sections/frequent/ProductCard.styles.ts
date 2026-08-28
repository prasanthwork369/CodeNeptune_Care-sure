import { CART_BUTTON_HEIGHT } from "@/src/constants/theme";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EEEFF1",
  },
  topTouch: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  imageBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EEEFF1",
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
  },
  discountBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 1,
  },
  discountText: {
    fontSize: moderateScale(10),
    fontWeight: "800",
    color: "#0F7635",
  },
  namePriceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  nameText: {
    fontWeight: "600",
    color: "#1C2024",
    flex: 1,
  },
  priceCol: {
    alignItems: "flex-end",
  },
  sellingPriceText: {
    fontWeight: "700",
  },
  mrpPriceText: {
    fontWeight: "400",
    color: "#919EAB",
    textDecorationLine: "line-through",
  },
  brandTextStepper: {
    fontWeight: "500",
    color: "#637381",
    marginTop: 3,
    marginBottom: 1,
  },
  descTextStepper: {
    fontWeight: "400",
    color: "#919EAB",
    marginTop: 2,
    marginBottom: 2,
  },
  brandLineText: {
    fontWeight: "400",
    color: "#637381",
  },
  qtyBadgeBox: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#EEEFF1",
    borderRadius: 6,
  },
  qtyBadgeText: {
    fontSize: moderateScale(12),
    fontWeight: "500",
    color: "#1C2024",
  },
  dividerDashed: {
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
  },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  stepperBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 0.69,
    borderColor: "#919EAB33",
    borderRadius: 8,
  },
  stepperBtn: {
    width: exactScale(36),
    height: exactScale(36),
    alignItems: "center",
    justifyContent: "center",
  },
  stepperBtnText: {
    fontSize: moderateScale(20),
    fontWeight: "500",
    color: "#1C2024",
  },
  stepperValueText: {
    fontWeight: "600",
    color: "#1C2024",
    paddingHorizontal: 8,
  },
  stepperAddBtn: {
    flex: 1,
    height: CART_BUTTON_HEIGHT,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#0F763533",
    backgroundColor: "#F1F9F4",
  },
  stepperAddBtnText: {
    fontSize: moderateScale(13),
    fontWeight: "600",
    color: "#0F7635",
  },
  counterPill: {
    width: exactScale(90),
    height: exactScale(35),
    alignSelf: "flex-end",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#0F7635",
  },
  counterBtn: {
    width: exactScale(36),
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  counterBtnText: {
    fontSize: moderateScale(20),
    color: "#FFFFFF",
    fontWeight: "500",
    lineHeight: moderateScale(24),
  },
  counterValueCol: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  counterValueText: {
    fontSize: moderateScale(14),
    fontWeight: "700",
    color: "#FFFFFF",
  },
  addBtn: {
    minWidth: exactScale(78),
    height: exactScale(35),
    alignSelf: "flex-end",
    borderRadius: exactScale(6),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#0F7635",
    paddingHorizontal: exactScale(24),
    backgroundColor: "#FFFFFF",
  },
  addBtnText: {
    fontSize: moderateScale(14),
    fontWeight: "700",
    color: "#0F7635",
  },
  orderedRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  orderedText: {
    fontWeight: "600",
    color: "#0F7635",
  },
  lastOrderedText: {
    fontWeight: "500",
    color: "#637381",
  },
});
