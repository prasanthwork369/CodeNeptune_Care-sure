import { StyleSheet } from "react-native";
import { exactScale, moderateScale, verticalScale } from "@/src/utils/exactScale";
import { typography } from "@/src/constants/typography";

export const styles = StyleSheet.create({
  loadingSpacer: {
    height: exactScale(80),
  },
  heartBanner: {
    paddingTop: exactScale(10),
    paddingBottom: 0,
    paddingHorizontal: exactScale(20),
  },
  skylineOverlayTextWrap: {
    position: "absolute",
    left: exactScale(20),
    top: exactScale(20),
    gap: 0,
  },
  skylineWordText: {
    fontFamily: "Inter-ExtraBold",
    fontWeight: "800",
    color: "#D4D4D4",
    textTransform: "uppercase",
    fontSize: moderateScale(60),
    lineHeight: verticalScale(65),
  },
  labelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    width: "100%",
    paddingHorizontal: exactScale(20),
    marginBottom: exactScale(20),
    paddingTop: exactScale(10),
  },
  labelItem: {
    alignItems: "flex-start",
  },
  label: {
    fontFamily: "Inter-Medium",
    fontWeight: "500",
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    letterSpacing: 0,
    color: "#0F1724",
    marginTop: exactScale(4),
  },
  icon: {
    width: exactScale(20),
    height: exactScale(18),
    top: exactScale(1.21),
    left: exactScale(0.67),
    opacity: 1,
  },
});
