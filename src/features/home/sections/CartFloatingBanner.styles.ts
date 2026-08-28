import { PILL_HEIGHT } from "@/src/components/navigation/LiquidTabBar.styles";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  pillShadowWrap: {
    boxShadow: "0px 0px 20px 0px #00000017",
    borderRadius: exactScale(999),
    backgroundColor: "#FFFFFF",
  },
  pillBorderWrap: {
    borderRadius: exactScale(999),
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#0000000D",
  },
  bannerInnerRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: exactScale(999),
    height: PILL_HEIGHT,
    paddingHorizontal: exactScale(12),
  },
  imageStack: {
    justifyContent: "center",
    height: exactScale(48),
    marginRight: exactScale(12),
  },
  titleSubCol: {
    flex: 1,
    justifyContent: "center",
    minWidth: 0,
    marginRight: exactScale(8),
  },
  titleText: {
    fontFamily: "Inter-Bold",
    fontWeight: "700",
    color: "#1A1C1E",
    fontSize: moderateScale(14),
    lineHeight: moderateScale(18),
  },
  subtitleText: {
    fontFamily: "Inter-Bold",
    fontWeight: "700",
    color: "#1A1C1E",
    fontSize: moderateScale(14),
    lineHeight: moderateScale(18),
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: exactScale(8),
    flexShrink: 0,
  },
  viewCartBtn: {
    backgroundColor: "#0F7635",
    borderRadius: exactScale(28),
    alignItems: "center",
    justifyContent: "center",
  },
  viewCartText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  viewCartItemCount: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  closeBtn: {
    borderRadius: exactScale(999),
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    width: exactScale(30),
    height: exactScale(30),
  },
  removeBtn: {
    position: "absolute",
    right: -exactScale(90),
    width: exactScale(90),
    height: "100%",
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: exactScale(999),
  },
  removeBtnText: {
    fontFamily: "Inter-SemiBold",
    fontWeight: "600",
    color: "#0F7635",
    fontSize: moderateScale(14),
  },
});
