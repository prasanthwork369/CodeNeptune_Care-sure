import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  innerWrap: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  contentWrap: {
    flex: 1,
  },
  trustedBg: {
    backgroundColor: "#FFFFFF",
  },
  notFoundContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: exactScale(32),
  },
  notFoundText: {
    fontFamily: "Inter-SemiBold",
    fontWeight: "600",
    color: "#333232",
    textAlign: "center",
    fontSize: moderateScale(16),
  },
});
