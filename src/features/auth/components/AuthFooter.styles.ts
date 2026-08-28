import {
  exactScale,
  moderateScale,
  scale,
  verticalScale,
} from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

const UNDERLINE_GAP = verticalScale(1);

export const styles = StyleSheet.create({
  icon: { width: scale(15), height: scale(15) },
  secureText: {
    fontSize: moderateScale(13),
    fontWeight: "500",
    color: "#6A6A6A",
  },
  policyRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "baseline",
    paddingHorizontal: scale(8),
  },
  policyText: {
    fontSize: moderateScale(12),
    fontWeight: "500",
    color: "#637381",
    lineHeight: verticalScale(20),
  },
  linkPress: {
    borderRadius: 6,
    paddingHorizontal: exactScale(3),
  },
  linkUnderline: {
    borderBottomWidth: 1,
    borderBottomColor: "#0F7635",
    paddingBottom: UNDERLINE_GAP,
  },
  linkText: {
    fontSize: moderateScale(12),
    fontWeight: "500",
    color: "#0F7635",
    lineHeight: moderateScale(15),
  },
});
