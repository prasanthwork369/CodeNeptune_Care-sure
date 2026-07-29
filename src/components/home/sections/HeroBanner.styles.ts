import { StyleSheet } from "react-native";
import { exactScale, moderateScale } from "@/src/utils/exactScale";

export const TITLE_LINE_HEIGHT = exactScale(30);

export const styles = StyleSheet.create({
  container: {
    height: exactScale(190),
    marginHorizontal: exactScale(14),
    marginTop: exactScale(20),
    borderRadius: exactScale(12),
    borderWidth: 1,
    borderColor: "#00D1501A",
    opacity: 1,
    overflow: "visible",
  },
  // Shared by the loaded card and the skeleton so neither can drift.
  gradientCard: {
    flex: 1,
    borderRadius: exactScale(12),
    overflow: "hidden",
  },
  // Placeholders sit on the green gradient, so they read as frosted glass
  // rather than the default grey, which clashed with the brand card.
  skeletonPlaceholder: {
    backgroundColor: "rgba(255,255,255,0.58)",
  },
  // Bottom-centred like the real image's contentPosition, so the smaller
  // placeholder still sits where the person's body will land.
  skeletonAvatarBox: {
    justifyContent: "flex-end",
    alignItems: "center",
  },
  // Larger than the text placeholders, so it's kept fainter to stay background.
  skeletonAvatar: {
    backgroundColor: "rgba(255,255,255,0.26)",
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
    top: exactScale(-22),
    right: exactScale(1),
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
  },
});

export const getDynamicStyles = (scale: number) => {
  const personWidth = Math.round(exactScale(184) * scale);
  // One title line occupies TITLE_LINE_HEIGHT; the bar covers the glyphs and
  // the margin makes up the rest, so the badge lands on the loaded card's y.
  const titleLine = Math.round(exactScale(30) * scale);
  const skeletonLineHeight = Math.round(exactScale(16) * scale);

  return StyleSheet.create({
    containerHeight: {
      height: Math.round(exactScale(190) * scale),
    },
    textBlock: {
      paddingRight: Math.round(personWidth * 0.6),
      paddingLeft: Math.round(exactScale(10) * scale),
      paddingTop: Math.round(exactScale(32) * scale),
    },
    skeletonLine1: {
      height: skeletonLineHeight,
      marginBottom: titleLine - skeletonLineHeight,
    },
    skeletonLine2: {
      height: skeletonLineHeight,
      // Extra gap reproduces badgeContainer's marginTop.
      marginBottom:
        titleLine - skeletonLineHeight + Math.round(exactScale(10) * scale),
    },
    // Matches the real pill: 4+4 padding around a 12pt line, plus borders.
    skeletonBadge: {
      width: Math.round(exactScale(92) * scale),
      height: Math.round(exactScale(20) * scale),
    },
    titleText: {
      fontSize: Math.round(moderateScale(20) * scale),
      lineHeight: Math.round(exactScale(30) * scale),
    },
    badgeContainer: {
      marginTop: Math.round(exactScale(10) * scale),
      paddingTop: Math.round(exactScale(4) * scale),
      paddingBottom: Math.round(exactScale(4) * scale),
      paddingLeft: Math.round(exactScale(7) * scale),
      paddingRight: Math.round(exactScale(7) * scale),
      gap: Math.round(exactScale(6) * scale),
    },
    badgeText: {
      fontSize: Math.round(moderateScale(12) * scale),
      lineHeight: Math.round(moderateScale(12) * scale),
    },
    avatar: {
      width: personWidth,
      height: Math.round(exactScale(211) * scale),
      top: Math.round(exactScale(-21) * scale),
    },
    decorMedicine: {
      width: Math.round(exactScale(20) * scale),
      height: Math.round(exactScale(20) * scale),
      top: Math.round(exactScale(144) * scale),
      left: Math.round(exactScale(140) * scale),
    },
    decorPills: {
      width: Math.round(exactScale(27.2) * scale),
      height: Math.round(exactScale(27.2) * scale),
      top: Math.round(exactScale(26.52) * scale),
      right: Math.round(exactScale(15) * scale),
    },
  });
};
