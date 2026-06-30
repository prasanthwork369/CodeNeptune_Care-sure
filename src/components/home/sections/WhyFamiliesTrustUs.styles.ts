import { StyleSheet } from "react-native";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { typography } from "@/src/constants/typography";

export const iconSize = 64;

export const styles = StyleSheet.create({
  title: {
    fontWeight: "700",
    fontSize: moderateScale(16),
    lineHeight: moderateScale(14),
    letterSpacing: 0,
    verticalAlign: "middle",
    color: "#222222",
  },
  iconContainer: {
    width: exactScale(64),
    height: exactScale(64),
    borderRadius: exactScale(12),
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    width: exactScale(64),
    height: exactScale(64),
    borderRadius: exactScale(12),
    opacity: 1,
  },
  itemLabel: {
    fontWeight: "500",
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    letterSpacing: 0,
    textAlign: "center",
    verticalAlign: "middle",
    color: "#0F1724",
    // Constrains the label to roughly the icon's width so short two-word
    // labels reliably wrap to two lines (per design) instead of fitting on
    // one line, since each item otherwise has plenty of row width to spare.
    width: exactScale(iconSize),
  },
});
