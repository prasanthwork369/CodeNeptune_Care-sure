import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: exactScale(16),
    marginTop: exactScale(14),
    rowGap: exactScale(12),
  },
  cardTouchable: {
    overflow: "hidden",
    justifyContent: "flex-start",
  },
  cardLabel: {
    fontFamily: "Inter-SemiBold",
    fontWeight: "600",
    color: "#111827",
    fontSize: moderateScale(13),
    lineHeight: moderateScale(16),
    paddingHorizontal: exactScale(8),
    paddingTop: exactScale(10),
    zIndex: 10,
  },
});
