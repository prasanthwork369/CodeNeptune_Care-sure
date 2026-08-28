import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: exactScale(24),
  },
  contentWrapper: {
    alignItems: "center",
    justifyContent: "center",
    transform: [{ translateY: exactScale(-10) }],
  },
  iconBox: {
    width: exactScale(262),
    height: exactScale(204),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: exactScale(30),
  },
  titleText: {
    fontFamily: "Inter-SemiBold",
    fontWeight: "600",
    color: "#000000",
    textAlign: "center",
    fontSize: moderateScale(18),
    lineHeight: moderateScale(20),
  },
  subtitleText: {
    fontFamily: "Inter-Medium",
    fontWeight: "500",
    color: "#6A6A6A",
    textAlign: "center",
    fontSize: moderateScale(14),
    lineHeight: moderateScale(22),
    marginTop: exactScale(6),
  },
  retryButton: {
    width: exactScale(137),
    height: moderateScale(14) * 2.8,
    borderRadius: exactScale(6),
    marginTop: exactScale(15),
    borderWidth: 1,
    borderColor: "#0F7635",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    opacity: 1,
  },
  retryButtonText: {
    fontSize: moderateScale(14),
    color: "#0F7635",
  },
});
