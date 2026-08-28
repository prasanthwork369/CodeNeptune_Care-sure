import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: exactScale(32),
  },
  historySectionWrap: {
    paddingHorizontal: exactScale(16),
    paddingTop: exactScale(20),
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: exactScale(12),
  },
  sectionTitle: {
    fontFamily: "Inter-Bold",
    fontWeight: "700",
    color: "#111827",
    fontSize: moderateScale(15),
  },
  clearBtn: {
    fontFamily: "Inter-SemiBold",
    fontWeight: "600",
    color: "#0F7635",
    fontSize: moderateScale(13),
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: exactScale(8),
  },
  chipWrapper: {
    position: "relative",
    paddingTop: exactScale(8),
    paddingRight: exactScale(8),
  },
  chipTouchable: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#919EAB33",
    borderRadius: exactScale(4),
    paddingHorizontal: exactScale(12),
    paddingVertical: exactScale(6),
    gap: exactScale(6),
  },
  chipText: {
    fontFamily: "Inter-Medium",
    fontWeight: "500",
    color: "#111827",
    fontSize: moderateScale(13),
  },
  trendingIcon: {
    width: exactScale(13),
    height: exactScale(13),
  },
  resentIcon: {
    width: exactScale(14),
    height: exactScale(14),
  },
  deleteBadge: {
    position: "absolute",
    top: exactScale(3),
    right: exactScale(1),
    width: exactScale(14),
    height: exactScale(14),
    borderRadius: exactScale(7),
    backgroundColor: "#FFE4E4",
    borderWidth: 1,
    borderColor: "#FFBDBD",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  deleteBadgeText: {
    fontFamily: "Inter-Bold",
    fontWeight: "700",
    color: "#E53E3E",
    fontSize: moderateScale(7),
    lineHeight: moderateScale(9),
  },
  frequentWrap: {
    paddingTop: exactScale(30),
  },
});
