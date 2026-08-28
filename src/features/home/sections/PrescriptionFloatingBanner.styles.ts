import { PILL_HEIGHT } from "@/src/components/navigation/LiquidTabBar.styles";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  pillShadowWrap: {
    boxShadow: "0px 0px 20px 0px #00000017",
    borderRadius: exactScale(999),
    backgroundColor: "#FFFFFF",
  },
  pillBorderWrap: {
    borderRadius: exactScale(999),
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#0000000D",
  },
  bannerInnerRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: exactScale(999),
    height: PILL_HEIGHT,
    paddingHorizontal: exactScale(12),
  },
  iconImage: {
    width: exactScale(44),
    height: exactScale(44),
    marginRight: exactScale(12),
  },
  iconImageCancelled: {
    width: exactScale(36),
    height: exactScale(36),
    marginRight: exactScale(12),
  },
  textCol: {
    flex: 1,
    justifyContent: "center",
    marginRight: exactScale(8),
    minWidth: 0,
    gap: exactScale(3),
  },
  titleText: {
    fontFamily: "Inter-Bold",
    fontWeight: "700",
    color: "#1A1C1E",
    fontSize: moderateScale(13),
    lineHeight: moderateScale(17),
  },
  subtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: exactScale(6),
  },
  subtitleText: {
    fontFamily: "Inter-Medium",
    fontWeight: "500",
    color: "#6A6A6A",
    fontSize: moderateScale(11),
    flexShrink: 1,
  },
  progressTrack: {
    height: exactScale(6),
    borderRadius: exactScale(999),
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
    flexShrink: 0,
  },
  progressFill: {
    height: exactScale(6),
    borderRadius: exactScale(999),
    backgroundColor: "#0F7635",
  },
  closeBtn: {
    width: exactScale(32),
    height: exactScale(32),
    borderRadius: exactScale(16),
    alignItems: "center",
    justifyContent: "center",
    marginRight: exactScale(8),
    flexShrink: 0,
  },
});
