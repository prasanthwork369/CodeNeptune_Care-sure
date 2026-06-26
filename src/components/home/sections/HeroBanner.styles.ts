import { StyleSheet } from "react-native";
import { exactScale, moderateScale } from "@/src/utils/exactScale";

export const TITLE_LINE_HEIGHT = exactScale(30);

export const styles = StyleSheet.create({
  container: {
    height: exactScale(190),
    marginHorizontal: exactScale(12),
    marginTop: exactScale(20),
    borderRadius: exactScale(12),
    borderWidth: 1,
    borderColor: "#00D1501A",
    opacity: 1,
    overflow: "visible",
  },
  skeletonContainer: {
    height: exactScale(190),
    marginHorizontal: exactScale(12),
    marginTop: exactScale(20),
    borderRadius: exactScale(12),
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FAFAFA",
    opacity: 1,
    overflow: "hidden",
  },
  titleText: {
    // Avoid fontWeight with custom fonts to prevent fallback issues on iOS/Android
    fontWeight: "800",
    fontSize: moderateScale(20),
    lineHeight: TITLE_LINE_HEIGHT,
    letterSpacing: 0,
    includeFontPadding: false,
    verticalAlign: "middle",
  },
  badgeContainer: {
    width: exactScale(160),
    height: exactScale(30),
    borderRadius: exactScale(9999),
    borderWidth: 1,
    borderColor: "#919EAB33",
    backgroundColor: "#FFFFFF",
    opacity: 1,
    paddingTop: exactScale(4),
    paddingRight: exactScale(7),
    paddingBottom: exactScale(4),
    paddingLeft: exactScale(7),
    gap: exactScale(6),
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginTop: exactScale(10),
    shadowColor: "#919EAB33",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  badgeText: {
    // Avoid fontWeight with custom fonts to prevent fallback issues on iOS/Android
    fontWeight: "600",
    fontSize: moderateScale(12),
    lineHeight: moderateScale(12),
    letterSpacing: 0,
    color: "#0F7635",
    verticalAlign: "middle",
  },
  badgeIcon: {
    width: exactScale(16.6),
    height: exactScale(20.5),
  },
  avatar: {
    position: "absolute",
    width: exactScale(184),
    height: exactScale(211),
    top: exactScale(-21),
    right: exactScale(-2),
  },
  decorMedicine: {
    position: "absolute",
    width: exactScale(20),
    height: exactScale(20),
    top: exactScale(144),
    left: exactScale(140),
  },
  decorPills: {
    position: "absolute",
    width: exactScale(27.2),
    height: exactScale(27.2),
    top: exactScale(26.52),
    right: exactScale(15),
    transform: [{ rotate: "-36.76deg" }],
  },
});
