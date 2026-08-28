import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  skeletonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  skeletonItem: {
    marginBottom: exactScale(24),
  },
  skeletonDetails: {
    marginTop: exactScale(8),
    rowGap: exactScale(8),
  },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: exactScale(80),
  },
  emptyText: {
    fontFamily: "Inter-Medium",
    fontWeight: "500",
    color: "#6B7280",
    fontSize: moderateScale(15),
  },
});
