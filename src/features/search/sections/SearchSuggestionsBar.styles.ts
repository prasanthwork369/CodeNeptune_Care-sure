import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  wrapper: {
    overflow: "hidden",
  },
  innerRow: {
    borderBottomWidth: 1,
    borderBottomColor: "#919EAB1A",
    backgroundColor: "#FFFFFF",
    paddingBottom: exactScale(8),
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: exactScale(16),
    paddingVertical: exactScale(12),
    gap: exactScale(10),
  },
  suggestionText: {
    flex: 1,
    fontFamily: "Inter-Medium",
    fontWeight: "500",
    color: "#222222",
    fontSize: moderateScale(13),
  },
});
