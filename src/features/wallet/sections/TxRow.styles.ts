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
    width: exactScale(18),
    height: exactScale(18),
  },
  rowItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: exactScale(24),
    paddingVertical: exactScale(15),
  },
  detailsWrap: {
    flex: 1,
    marginLeft: exactScale(16),
  },
  titleText: {
    fontSize: moderateScale(15),
    fontWeight: "600",
    color: "#111827",
  },
  dateText: {
    fontSize: moderateScale(13),
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
    fontSize: moderateScale(15),
    fontWeight: "700",
  },
  separator: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginHorizontal: exactScale(16),
  },
});
