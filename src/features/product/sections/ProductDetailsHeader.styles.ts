import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  root: {
    paddingHorizontal: exactScale(16),
    paddingBottom: exactScale(8),
    zIndex: 20,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: "#919EAB33",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: exactScale(48),
  },
  roundBtn: {
    backgroundColor: "#FFFFFF",
    borderRadius: exactScale(999),
    borderWidth: 1,
    borderColor: "#919EAB33",
    alignItems: "center",
    justifyContent: "center",
    width: exactScale(44),
    height: exactScale(44),
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: exactScale(12),
  },
  cartBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: exactScale(16),
    height: exactScale(16),
    borderRadius: exactScale(8),
    backgroundColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: exactScale(3),
  },
  cartBadgeText: {
    fontFamily: "Inter-Bold",
    fontWeight: "700",
    color: "#FFFFFF",
    fontSize: moderateScale(10),
    lineHeight: moderateScale(12),
  },
});
