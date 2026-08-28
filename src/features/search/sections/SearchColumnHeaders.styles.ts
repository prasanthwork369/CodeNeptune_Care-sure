import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    marginHorizontal: exactScale(16),
    backgroundColor: "#FBFBFB",
  },
  headerCell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: exactScale(12),
  },
  youSearchedText: {
    fontFamily: "Inter-Bold",
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontSize: moderateScale(11),
  },
});
