import { StyleSheet } from "react-native";
import { moderateScale, scale } from "react-native-size-matters";

export const SEARCH_ICON_SIZE = scale(18);

export const styles = StyleSheet.create({
  cyclerText: {
    fontWeight: "500",
    fontSize: moderateScale(14, 0.3),
    lineHeight: moderateScale(18, 0.3),
    letterSpacing: 0,
    verticalAlign: "middle",
  },
  placeholderText: {
    fontWeight: "500",
    fontSize: moderateScale(14, 0.3),
    lineHeight: moderateScale(18, 0.3),
    letterSpacing: 0,
    verticalAlign: "middle",
  },
  inputText: {
    fontWeight: "500",
    fontSize: moderateScale(14, 0.3),
    lineHeight: moderateScale(18, 0.3),
    letterSpacing: 0,
    verticalAlign: "middle",
  },
  uploadIcon: { width: scale(22), height: scale(22) },
  container: {
    height: moderateScale(55, 0.3),
    borderRadius: 10,
    borderWidth: 1.05,
    borderColor: "#919EAB33",
    paddingLeft: moderateScale(10, 0.3),
    paddingRight: moderateScale(10, 0.3),
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#919EAB",
    shadowOffset: { width: 0, height: 16 },
    shadowRadius: 20,
    shadowOpacity: 0.04,
    elevation: 1,
    opacity: 1,
  },
});
