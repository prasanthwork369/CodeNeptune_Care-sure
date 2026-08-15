import { colors } from "@/src/theme";
import { moderateScale, scale, verticalScale } from "@/src/utils/exactScale";
import { Platform, StyleSheet } from "react-native";

// Field-level red, deliberately lighter than the app-wide colors.error (#DC2626).
const FIELD_ERROR = "#EF4444";

export const styles = StyleSheet.create({
  inputWrap: {
    width: "100%",
    maxWidth: scale(361),
    alignSelf: "center",
    minHeight: verticalScale(56),
    borderRadius: scale(8),
    borderWidth: 1,
    paddingTop: verticalScale(10),
    paddingRight: scale(16),
    paddingBottom: verticalScale(10),
    paddingLeft: scale(16),
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    gap: scale(10),
    marginTop: verticalScale(8),
  },
  // Static variants, so no style object is rebuilt per keystroke.
  inputWrapIdle: { borderColor: colors.border },
  inputWrapFocused: { borderColor: colors.primary },
  inputWrapError: { borderColor: FIELD_ERROR },
  prefix: {
    fontSize: moderateScale(17),
    fontWeight: "500",
    color: colors.text,
  },
  input: {
    flex: 1,
    height: "100%",
    paddingVertical: 0,
    paddingHorizontal: 0,
    fontSize: moderateScale(15),
    // Android renders weight via the loaded font file itself (fontWeight is
    // ignored once fontFamily is set to a specific static Inter weight) --
    // use the Regular weight file directly instead of setting a numeric
    // fontWeight that has no effect.
    fontFamily: Platform.OS === "android" ? "Inter_400Regular" : undefined,
    fontWeight: Platform.OS === "android" ? "normal" : "400",
    letterSpacing: 0,
    color: colors.text,
  },
  divider: {
    width: scale(2),
    height: verticalScale(20),
    backgroundColor: colors.text,
  },
  error: {
    fontSize: moderateScale(13),
    fontWeight: "500",
    color: FIELD_ERROR,
    marginTop: verticalScale(6),
    marginBottom: verticalScale(4),
    paddingHorizontal: scale(4),
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
    marginVertical: verticalScale(16),
  },
  btnEnabled: { opacity: 1 },
  btnDisabled: { opacity: 0.6 },
  btnText: {
    fontSize: moderateScale(16),
    fontWeight: "700",
    color: "white",
    marginRight: scale(8),
  },
});
