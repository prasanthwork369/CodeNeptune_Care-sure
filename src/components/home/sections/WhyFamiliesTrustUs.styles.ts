import { StyleSheet } from "react-native";

export const iconSize = 64;

export const styles = StyleSheet.create({
  title: {
    fontWeight: "700",
    fontSize: 16,
    lineHeight: 14,
    letterSpacing: 0,
    verticalAlign: "middle",
    color: "#222222",
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 12,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    width: 64,
    height: 64,
    borderRadius: 12,
    opacity: 1,
  },
  itemLabel: {
    fontWeight: "500",
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
    textAlign: "center",
    verticalAlign: "middle",
    color: "#0F1724",
    // Constrains the label to roughly the icon's width so short two-word
    // labels reliably wrap to two lines (per design) instead of fitting on
    // one line, since each item otherwise has plenty of row width to spare.
    width: iconSize,
  },
});
