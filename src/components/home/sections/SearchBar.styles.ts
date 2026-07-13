import { StyleSheet } from "react-native";
import { exactScale, moderateScale } from "@/src/utils/exactScale";

export const SEARCH_ICON_SIZE = exactScale(18);

export const styles = StyleSheet.create({
  cyclerText: {
    fontWeight: "500",
    fontSize: moderateScale(14),
    lineHeight: moderateScale(18),
    letterSpacing: 0,
    verticalAlign: "middle",
  },
  placeholderText: {
    fontWeight: "500",
    fontSize: moderateScale(14),
    lineHeight: moderateScale(18),
    letterSpacing: 0,
    verticalAlign: "middle",
  },
  inputText: {
    fontWeight: "500",
    fontSize: moderateScale(14),
    lineHeight: moderateScale(18),
    letterSpacing: 0,
    verticalAlign: "middle",
  },
  uploadIcon: { width: exactScale(22), height: exactScale(22) },
  container: {
    height: exactScale(60),
    borderRadius: exactScale(10),
    borderWidth: 1.05,
    borderColor: "#919EAB33",
    paddingLeft: exactScale(10),
    paddingRight: exactScale(10),
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#919EAB",
    shadowOffset: { width: 0, height: exactScale(16) },
    shadowRadius: exactScale(20),
    shadowOpacity: 0.04,
    elevation: 1,
    opacity: 1,
  },
});
