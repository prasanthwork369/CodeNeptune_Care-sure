import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const SEARCH_ICON_SIZE = exactScale(20);

export const styles = StyleSheet.create({
  cyclerText: {
    fontFamily: "Inter-Medium",
    fontWeight: "500",
    color: "#6A6A6A",
    fontSize: moderateScale(14),
    lineHeight: moderateScale(18),
    letterSpacing: 0,
    verticalAlign: "middle",
  },
  placeholderText: {
    fontFamily: "Inter-Medium",
    fontWeight: "500",
    color: "#6A6A6A",
    fontSize: moderateScale(14),
    lineHeight: moderateScale(18),
    letterSpacing: 0,
    verticalAlign: "middle",
  },
  inputText: {
    flex: 1,
    fontFamily: "Inter-Regular",
    fontWeight: "500",
    color: "#222222",
    fontSize: moderateScale(14),
    lineHeight: moderateScale(18),
    letterSpacing: 0,
    verticalAlign: "middle",
    paddingVertical: exactScale(6),
    marginLeft: exactScale(8),
  },
  uploadIcon: {
    width: exactScale(22),
    height: exactScale(22),
  },
  touchableContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: exactScale(6),
    paddingHorizontal: exactScale(16),
    paddingVertical: exactScale(12),
    borderWidth: 1,
    borderColor: "#919EAB33",
    shadowColor: "#919EAB",
    shadowOffset: { width: 0, height: exactScale(16) },
    shadowRadius: exactScale(20),
    shadowOpacity: 0.04,
    elevation: 1,
  },
  cyclerWrapper: {
    flex: 1,
    marginLeft: exactScale(8),
    paddingVertical: exactScale(6),
    overflow: "hidden",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: exactScale(6),
    paddingHorizontal: exactScale(16),
    paddingVertical: exactScale(14),
    borderWidth: 1,
    borderColor: "#919EAB33",
    shadowColor: "#919EAB",
    shadowOffset: { width: 0, height: exactScale(16) },
    shadowRadius: exactScale(20),
    shadowOpacity: 0.04,
    elevation: 1,
  },
  rightSlotWrap: {
    marginLeft: exactScale(8),
  },
});
