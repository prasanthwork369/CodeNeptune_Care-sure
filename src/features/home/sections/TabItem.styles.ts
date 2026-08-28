import { StyleSheet } from "react-native";
import { exactScale, moderateScale } from "@/src/utils/exactScale";

export const styles = StyleSheet.create({
  touchable: {
    alignItems: "center",
    justifyContent: "flex-end",
    marginHorizontal: exactScale(16),
    paddingBottom: exactScale(12),
    paddingHorizontal: exactScale(4),
  },
  contentWrap: {
    alignItems: "center",
    justifyContent: "flex-end",
  },
  iconWrap: {
    width: exactScale(36),
    height: exactScale(32),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: exactScale(2),
  },
  icon: {
    width: exactScale(30),
    height: exactScale(30),
  },
  emoji: {
    fontSize: moderateScale(26),
  },
  labelActive: {
    fontFamily: "Inter-SemiBold",
    fontWeight: "600",
    color: "#111827",
    fontSize: moderateScale(13),
  },
  labelInactive: {
    fontFamily: "Inter-Medium",
    fontWeight: "500",
    color: "#111827",
    fontSize: moderateScale(13),
  },
});
