import { moderateScale, scale, verticalScale } from "@/src/utils/exactScale";
import { Platform, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  boxRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: scale(8),
    marginVertical: verticalScale(12),
    marginHorizontal: scale(2),
    width: "100%",
    alignSelf: "center",
  },
  otpBox: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(10),
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  otpDigit: {
    textAlignVertical: "center",
    includeFontPadding: false,
    fontSize: moderateScale(24),
    fontFamily: Platform.OS === "android" ? "Inter_700Bold" : undefined,
    fontWeight: "700",
    lineHeight: verticalScale(24),
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
    color: "#EF4444",
    textAlign: "center",
    marginBottom: verticalScale(8),
  },
  resendText: {
    fontSize: moderateScale(13),
    fontWeight: "500",
    color: "#637381",
    paddingVertical: verticalScale(8),
  },
  resendHighlight: { color: "#0F7635", fontWeight: "700" },
  resendBtn: {
    fontSize: moderateScale(13),
    fontWeight: "700",
    color: "#0F7635",
    textDecorationLine: "underline",
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
    backgroundColor: "#0F7635",
    marginVertical: verticalScale(12),
  },
  btnText: {
    fontSize: moderateScale(16),
    fontWeight: "700",
    color: "white",
    marginRight: scale(8),
  },
  arrow: { width: moderateScale(13), height: moderateScale(13) },
});
