import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  loadingContainer: {
    paddingHorizontal: exactScale(16),
    paddingTop: exactScale(16),
    gap: exactScale(12),
  },
  emptyContainer: {
    alignItems: "center",
  },
  emptyText: {
    textAlign: "center",
    color: "#9CA3AF",
    fontWeight: "500",
    fontSize: moderateScale(14),
    marginTop: exactScale(40),
  },
  pageContainer: {
    flex: 1,
  },
  listContent: {
    backgroundColor: "#FFFFFF",
  },
  footerLoader: {
    paddingVertical: exactScale(16),
  },
});
