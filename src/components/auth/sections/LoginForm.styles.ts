import { moderateScale, scale, verticalScale } from "@/src/utils/exactScale";
import { Platform, StyleSheet } from "react-native";

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
    backgroundColor: "#FFFFFF",
    gap: scale(10),
    marginTop: verticalScale(8),
  },
  prefix: {
    fontSize: moderateScale(17, 0.3),
    fontWeight: "500",
    color: "#222222",
  },
  input: {
    flex: 1,
    height: "100%",
    paddingVertical: 0,
    paddingHorizontal: 0,
    fontSize: moderateScale(15, 0.3),
    // Android renders weight via the loaded font file itself (fontWeight is
    // ignored once fontFamily is set to a specific static Inter weight) --
    // use the Regular weight file directly instead of setting a numeric
    // fontWeight that has no effect.
    fontFamily: Platform.OS === "android" ? "Inter_400Regular" : undefined,
    fontWeight: Platform.OS === "android" ? "normal" : "400",
    letterSpacing: 0,
    color: "#222222",
  },
  divider: {
    width: scale(2),
    height: verticalScale(20),
    backgroundColor: "#222222",
  },
  error: {
    fontSize: moderateScale(13, 0.3),
    fontWeight: "500",
    color: "#EF4444",
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
    backgroundColor: "#0F7635",
    marginVertical: verticalScale(16),
  },
  btnText: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: "700",
    color: "white",
    marginRight: scale(8),
  },
  arrow: { width: moderateScale(13, 0.3), height: moderateScale(13, 0.3) },
});
