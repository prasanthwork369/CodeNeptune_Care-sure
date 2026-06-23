import { StyleSheet } from "react-native";
import { moderateScale, scale } from "react-native-size-matters";

export const TITLE_LINE_HEIGHT = moderateScale(30, 0.3);

export const styles = StyleSheet.create({
  container: {
    height: moderateScale(190, 0.3),
    marginHorizontal: scale(12),
    marginTop: scale(20),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#00D1501A",
    opacity: 1,
    overflow: "visible",
  },
  skeletonContainer: {
    height: moderateScale(190, 0.3),
    marginHorizontal: scale(12),
    marginTop: scale(20),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FAFAFA",
    opacity: 1,
    overflow: "hidden",
  },
  titleText: {
    // Avoid fontWeight with custom fonts to prevent fallback issues on iOS/Android
    fontWeight: "800",
    fontSize: moderateScale(20, 0.1),
    lineHeight: TITLE_LINE_HEIGHT,
    letterSpacing: 0,
    includeFontPadding: false,
    verticalAlign: "middle",
  },
  badgeContainer: {
    width: moderateScale(160, 0.3),
    height: moderateScale(30, 0.3),
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: "#919EAB33",
    backgroundColor: "#FFFFFF",
    opacity: 1,
    paddingTop: moderateScale(5, 0.3),
    paddingRight: moderateScale(8, 0.3),
    paddingBottom: moderateScale(5, 0.3),
    paddingLeft: moderateScale(8, 0.3),
    gap: moderateScale(6, 0.3),
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginTop: moderateScale(10, 0.3),
    shadowColor: "#919EAB33",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    
  },
  badgeText: {
    // Avoid fontWeight with custom fonts to prevent fallback issues on iOS/Android
    fontWeight: "600",
    fontSize: moderateScale(12, 0.1),
    lineHeight: moderateScale(12, 0.1),
    letterSpacing: 0,
    color: "#0F7635",
    verticalAlign: "middle",
  },
  badgeIcon: {
    width: moderateScale(16.6, 0.3),
    height: moderateScale(20.5, 0.3),
  },
  avatar: {
    position: "absolute",
    width: moderateScale(184, 0.1),
    height: moderateScale(211, 0.3),
    top: moderateScale(-21, 0.3),
    right: moderateScale(-2, 0.3),
  },
  decorMedicine: {
    position: "absolute",
    width: moderateScale(20, 0.3),
    height: moderateScale(20, 0.3),
    top: moderateScale(144, 0.3),
    left: moderateScale(140, 0.3),
  },
  decorPills: {
    position: "absolute",
    width: moderateScale(27.2, 0.3),
    height: moderateScale(27.2, 0.3),
    top: moderateScale(26.52, 0.3),
    right: moderateScale(15, 0.3),
    transform: [{ rotate: "-36.76deg" }],
  },
});
