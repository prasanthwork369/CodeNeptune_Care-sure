import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  cardRoot: {
    backgroundColor: "#FFFFFF",
    borderRadius: exactScale(12),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.77,
    borderColor: "#919EAB33",
    paddingHorizontal: exactScale(12),
  },
  iconCircle: {
    alignItems: "center",
    justifyContent: "center",
    width: exactScale(64),
    height: exactScale(64),
    borderRadius: exactScale(32),
    marginBottom: exactScale(14),
  },
  titleText: {
    fontFamily: "Inter-Bold",
    fontWeight: "700",
    textAlign: "center",
    fontSize: moderateScale(16),
  },
  subtitleText: {
    fontFamily: "Inter-Medium",
    fontWeight: "500",
    color: "#6B7280",
    textAlign: "center",
    fontSize: moderateScale(13),
    marginTop: exactScale(6),
  },
});
