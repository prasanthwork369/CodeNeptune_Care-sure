import { StyleSheet } from "react-native";
import { scale, verticalScale, moderateScale } from "@/src/utils/exactScale";

export const styles = StyleSheet.create({
  title: {
    fontSize: moderateScale(26),
    fontWeight: "800",
    color: "#222222",
    lineHeight: moderateScale(34),
    letterSpacing: 0,
  },
  phone: {
    fontSize: moderateScale(14),
    fontWeight: "500",
    color: "#222222",
    lineHeight: moderateScale(30),
    letterSpacing: 0,
    marginRight: scale(8),
  },
  editBtn: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#0F7635",
    // Hugs the glyphs so the gap below is this style's alone, not font metrics'.
    lineHeight: moderateScale(16),
    includeFontPadding: false,
    letterSpacing: 0,
  },
  // Real border, not textDecorationLine: RN can't offset an underline, so iOS drew it tight to the glyphs while Android left a gap.
  editBtnUnderline: {
    borderBottomWidth: 1,
    borderBottomColor: "#0F7635",
    paddingBottom: 0,
  },
  headerContainer: {
    marginBottom: verticalScale(4),
    paddingHorizontal: scale(8),
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: verticalScale(8),
  },
});
