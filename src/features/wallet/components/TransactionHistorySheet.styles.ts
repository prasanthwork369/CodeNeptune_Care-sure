import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  iconContainer: {
    width: exactScale(44),
    height: exactScale(44),
    borderRadius: exactScale(22),
    alignItems: "center",
    justifyContent: "center",
  },
  iconImage: {
    width: exactScale(26),
    height: exactScale(26),
  },
  sheetBackground: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: exactScale(12),
    borderTopRightRadius: exactScale(12),
  },
  titleContainer: {
    alignItems: "center",
    paddingTop: exactScale(24),
    paddingBottom: exactScale(16),
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  titleText: {
    fontSize: moderateScale(16),
    fontWeight: "700",
    color: "#111827",
  },
  scrollView: {
    flex: 1,
  },
  emptyText: {
    textAlign: "center",
    color: "#9CA3AF",
    fontWeight: "500",
    fontSize: moderateScale(14),
    paddingVertical: exactScale(32),
  },
  rowItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: exactScale(20),
    paddingVertical: exactScale(14),
  },
  rowDetails: {
    flex: 1,
    marginLeft: exactScale(14),
  },
  rowTitle: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#111827",
  },
  rowDate: {
    fontSize: moderateScale(12),
    color: "#6B7280",
    marginTop: exactScale(2),
  },
  coinAmountWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: exactScale(4),
  },
  coinIcon: {
    width: exactScale(16),
    height: exactScale(16),
  },
  amountText: {
    fontSize: moderateScale(14),
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginHorizontal: exactScale(20),
  },
  seeAllContainer: {
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingVertical: exactScale(16),
    alignItems: "center",
  },
  seeAllText: {
    fontSize: moderateScale(14),
    fontWeight: "700",
    color: "#FF8A00",
  },
});
