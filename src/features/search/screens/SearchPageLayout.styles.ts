import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  gradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: exactScale(110),
  },
  searchingBody: {
    flex: 1,
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
