import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F5F6FB",
  },
  headerRightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: exactScale(10),
  },
  actionButton: {
    width: exactScale(48),
    height: exactScale(48),
    borderRadius: exactScale(24),
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#919EAB33",
    alignItems: "center",
    justifyContent: "center",
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
  floatingBannerWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 50,
  },
});
