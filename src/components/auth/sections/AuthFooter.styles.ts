import { StyleSheet } from "react-native";
import { scale, verticalScale, moderateScale } from "@/src/utils/exactScale";

export const styles = StyleSheet.create({
  wrap: { paddingBottom: verticalScale(16) },
  icon: { width: scale(15), height: scale(15) },
  secureText: {
    fontSize: moderateScale(13, 0.3),
    fontWeight: "500",
    color: "#637381",
  },
  policyText: {
    fontSize: moderateScale(12, 0.3),
    fontWeight: "500",
    color: "#637381",
    textAlign: "center",
    paddingHorizontal: scale(8),
    lineHeight: verticalScale(20),
  },
  link: {
    color: "#0F7635",
    fontWeight: "500",
    textDecorationLine: "underline",
    fontSize: moderateScale(12, 0.3),
  },
});
