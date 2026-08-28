import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F5F6FB",
  },
  filterPill: {
    paddingHorizontal: exactScale(14),
    paddingVertical: exactScale(8),
    borderRadius: exactScale(999),
    borderWidth: 1,
    borderColor: "#919EAB33",
    backgroundColor: "#FFFFFF",
  },
  filterPillActive: {
    borderColor: "#0F7635",
    backgroundColor: "#0F7635",
  },
  filterPillText: {
    fontSize: moderateScale(13),
    fontWeight: "500",
    color: "#6A6A6A",
  },
  filterPillTextActive: {
    fontWeight: "700",
    color: "#FFFFFF",
  },
  filtersRow: {
    flexDirection: "row",
    gap: exactScale(8),
    paddingHorizontal: exactScale(16),
    paddingBottom: exactScale(12),
  },
  listContent: {
    paddingHorizontal: exactScale(16),
    paddingTop: exactScale(4),
  },
  emptyCenter: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: exactScale(48),
  },
  emptyTitle: {
    fontSize: moderateScale(15),
    fontWeight: "700",
    color: "#222222",
    marginBottom: exactScale(4),
  },
  emptySubtitle: {
    fontSize: moderateScale(13),
    color: "#6A6A6A",
  },
});
