import { moderateScale, scale, verticalScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  wrap: { paddingBottom: verticalScale(16) },
  icon: { width: scale(15), height: scale(15) },
  secureText: {
    fontSize: moderateScale(13),
    fontWeight: "500",
    color: "#6A6A6A",
  },
  policyText: {
    fontSize: moderateScale(12),
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
    fontSize: moderateScale(12),
  },
});
