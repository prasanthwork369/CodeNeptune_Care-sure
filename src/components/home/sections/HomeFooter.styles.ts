import { StyleSheet } from "react-native";
import { exactScale } from "@/src/utils/exactScale";
import { typography } from "@/src/constants/typography";

export const styles = StyleSheet.create({
  label: {
    fontWeight: "500",
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    letterSpacing: 0,
    textAlign: "left",
    verticalAlign: "middle",
    color: "#0F1724",
  },
  icon: {
    width: exactScale(20),
    height: exactScale(18),
    top: exactScale(1.21),
    left: exactScale(0.67),
    opacity: 1,
  },
});
