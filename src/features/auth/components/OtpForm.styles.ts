import { colors } from "@/src/theme";
import { moderateScale, scale, verticalScale } from "@/src/utils/exactScale";
import { Platform, StyleSheet } from "react-native";

// Field-level red, deliberately lighter than the app-wide colors.error (#DC2626).
const FIELD_ERROR = "#EF4444";

export const styles = StyleSheet.create({
  boxRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginVertical: verticalScale(10),
    marginHorizontal: scale(2),
    width: "100%",
    alignSelf: "center",
  },
  otpBox: {
    flex: 1,
    maxWidth: 48,
    aspectRatio: 1,
    borderRadius: scale(10),
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  // Static variants, so six boxes don't rebuild styles per keystroke.
  boxBorderThin: { borderWidth: 1 },
  boxBorderThick: { borderWidth: 2 },
  boxIdle: { borderColor: "#D0D5DD" },
  boxAccent: { borderColor: colors.primary },
  boxError: { borderColor: FIELD_ERROR },
  boxFillActive: { backgroundColor: "#F0FDF4" },
  boxFillPlain: { backgroundColor: colors.white },
  otpDigit: {
    textAlignVertical: "center",
    includeFontPadding: false,
    fontSize: moderateScale(24),
    fontFamily: Platform.OS === "android" ? "Inter_700Bold" : undefined,
    fontWeight: "700",
    // Android only: iOS ignores the props above, so a short line box shifts the digit up.
    lineHeight: Platform.OS === "android" ? verticalScale(24) : undefined,
    letterSpacing: 0,
    color: "#111827",
    textAlign: "center",
  },
  caret: {
    width: 2,
    height: verticalScale(24),
    borderRadius: 1,
    backgroundColor: "#0F7635",
  },
  // 1x1 point tucked in the corner — NOT overlaying the boxes. When it
  // covered the row, Android's native input grabbed taps (pointerEvents
  // "none" is ignored for TextInput there) and showed its teal selection
  // handle over the boxes. Off to the side, the box Pressables own every
  // tap and focus() it programmatically; keyboard + SMS autofill still work.
  hiddenInput: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 1,
    height: 1,
    opacity: 0,
    color: "transparent",
    padding: 0,
  },
  error: {
    fontSize: moderateScale(13),
    fontWeight: "500",
    color: FIELD_ERROR,
    textAlign: "center",
    marginBottom: verticalScale(8),
  },
  btnEnabled: { opacity: 1 },
  btnDisabled: { opacity: 0.6 },
  resendText: {
    fontSize: moderateScale(13),
    fontWeight: "500",
    color: "#637381",
    paddingVertical: verticalScale(4),
  },
  resendHighlight: { color: "#0F7635", fontWeight: "700" },
  resendBtn: {
    fontSize: moderateScale(13),
    fontWeight: "700",
    color: "#0F7635",
    // Hugs the glyphs so the gap below is this style's alone, not font metrics'.
    lineHeight: moderateScale(15),
  },
  // Border, not textDecorationLine: RN can't offset an underline, so iOS drew it tight.
  resendUnderline: {
    borderBottomWidth: 1,
    borderBottomColor: "#0F7635",
    paddingBottom: verticalScale(1),
  },
  btn: {
    width: "100%",
    maxWidth: scale(361),
    alignSelf: "center",
    minHeight: verticalScale(50),
    borderRadius: scale(12),
    paddingTop: verticalScale(10),
    paddingRight: scale(16),
    paddingBottom: verticalScale(10),
    paddingLeft: scale(16),
    gap: scale(12),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    marginBottom: verticalScale(8),
  },
  btnText: {
    fontSize: moderateScale(16),
    fontWeight: "700",
    color: "white",
    marginRight: scale(8),
  },
  arrow: { width: moderateScale(13), height: moderateScale(13) },
});
