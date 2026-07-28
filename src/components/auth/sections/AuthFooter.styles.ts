import { exactScale, moderateScale, scale, verticalScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

// Single knob for the space between link text and its underline.
const UNDERLINE_GAP = verticalScale(1);

export const styles = StyleSheet.create({
  wrap: { paddingBottom: verticalScale(16) },
  icon: { width: scale(15), height: scale(15) },
  secureText: {
    fontSize: moderateScale(13),
    fontWeight: "500",
    color: "#6A6A6A",
  },
  // Baseline keeps the tighter-line-height links on the sentence's line.
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
  // Border, not textDecorationLine: RN can't offset an underline, so iOS drew it tight.
  linkUnderline: {
    borderBottomWidth: 1,
    borderBottomColor: "#0F7635",
    paddingBottom: UNDERLINE_GAP,
  },
  linkText: {
    fontSize: moderateScale(12),
    fontWeight: "500",
    color: "#0F7635",
    // Hugs the glyphs so UNDERLINE_GAP is the only space below them.
    lineHeight: moderateScale(15),
  },
});
