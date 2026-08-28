import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    alignItems: "center",
    gap: exactScale(8),
  },
  actionButton: {
    borderRadius: exactScale(22),
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#919EAB33",
    alignItems: "center",
    justifyContent: "center",
    width: exactScale(44),
    height: exactScale(44),
  },
  cartWrap: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: exactScale(-4),
    right: exactScale(-4),
    width: exactScale(20),
    height: exactScale(20),
    borderRadius: exactScale(10),
    backgroundColor: "#C22923",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontFamily: "Inter-Bold",
    fontWeight: "700",
    color: "#FFFFFF",
    fontSize: moderateScale(10),
  },
});
