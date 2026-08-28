import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F5F6FB",
  },
  cartBtnWrap: {
    position: "relative",
  },
  cartBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#919EAB33",
    alignItems: "center",
    justifyContent: "center",
  },
  cartBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#C22923",
    alignItems: "center",
    justifyContent: "center",
  },
  cartBadgeText: {
    fontSize: moderateScale(10),
    fontWeight: "700",
    color: "#fff",
  },
  searchBarWrap: {
    paddingHorizontal: exactScale(16),
    paddingTop: exactScale(12),
    paddingBottom: exactScale(10),
    backgroundColor: "#fff",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F6FB",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#EEEFF1",
    height: 46,
    paddingHorizontal: exactScale(12),
  },
  searchIcon: {
    marginRight: exactScale(8),
  },
  searchInput: {
    flex: 1,
    fontSize: moderateScale(14),
    fontWeight: "400",
    color: "#1C2024",
    paddingVertical: 0,
  },
  categoryFilterWrap: {
    backgroundColor: "#fff",
    paddingBottom: exactScale(10),
  },
  categoryFilterContent: {
    paddingHorizontal: exactScale(16),
    gap: exactScale(8),
    alignItems: "center",
  },
  chip: {
    paddingHorizontal: exactScale(16),
    paddingVertical: exactScale(6),
    borderRadius: 20,
    borderWidth: 1,
  },
  chipActive: {
    backgroundColor: "#0F7635",
    borderColor: "#0F7635",
  },
  chipInactive: {
    backgroundColor: "#F5F6FB",
    borderColor: "#EEEFF1",
  },
  chipText: {
    fontSize: moderateScale(13),
  },
  chipTextActive: {
    fontWeight: "600",
    color: "#fff",
  },
  chipTextInactive: {
    fontWeight: "500",
    color: "#637381",
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F1F3",
  },
  shimmerList: {
    paddingHorizontal: exactScale(16),
    paddingTop: exactScale(14),
    gap: exactScale(12),
  },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: exactScale(32),
  },
  emptyTitle: {
    fontSize: moderateScale(16),
    fontWeight: "600",
    color: "#637381",
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: moderateScale(13),
    fontWeight: "400",
    color: "#919EAB",
    marginTop: exactScale(6),
    textAlign: "center",
  },
  listContent: {
    paddingTop: exactScale(14),
  },
});
