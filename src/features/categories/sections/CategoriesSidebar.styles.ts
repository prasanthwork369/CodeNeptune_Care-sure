import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const INDICATOR_HEIGHT = exactScale(64);

export const styles = StyleSheet.create({
  loadingRoot: {
    backgroundColor: "#F7F8FA",
    borderRightWidth: 1,
    borderRightColor: "#919EAB33",
  },
  skeletonItem: {
    alignItems: "center",
    paddingVertical: exactScale(16),
    rowGap: exactScale(8),
  },
  root: {
    height: "100%",
    alignSelf: "stretch",
    backgroundColor: "#F2F4F7",
    zIndex: 10,
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#F2F4F7",
  },
  scrollContent: {
    backgroundColor: "#F2F2F7",
    flexGrow: 1,
  },
  indicator: {
    position: "absolute",
    left: 0,
    top: 0,
    width: exactScale(4.5),
    height: INDICATOR_HEIGHT,
    borderTopRightRadius: exactScale(4),
    borderBottomRightRadius: exactScale(4),
    zIndex: 20,
    backgroundColor: "#0F7635",
  },
  tabWrapper: {
    width: "100%",
  },
  tabTouchable: {
    alignItems: "center",
    paddingVertical: exactScale(12),
    paddingHorizontal: exactScale(4),
  },
  iconActiveGrad: {
    width: exactScale(48),
    height: exactScale(48),
    borderRadius: exactScale(14),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: exactScale(5),
    position: "relative",
  },
  iconInactiveBox: {
    width: exactScale(48),
    height: exactScale(48),
    borderRadius: exactScale(14),
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: exactScale(5),
    borderWidth: 1,
    borderColor: "#E5E7EB",
    position: "relative",
  },
  tabImage: {
    width: exactScale(40),
    height: exactScale(40),
    position: "absolute",
  },
  labelText: {
    fontSize: moderateScale(10.5),
    lineHeight: moderateScale(13),
    textAlign: "center",
    paddingHorizontal: exactScale(2),
  },
  labelTextActive: {
    fontFamily: "Inter-Bold",
    fontWeight: "700",
    color: "#0F7635",
  },
  labelTextInactive: {
    fontFamily: "Inter-Medium",
    fontWeight: "500",
    color: "#334155",
  },
});
