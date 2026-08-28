import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  inner: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: exactScale(32),
  },
  notFoundText: {
    fontSize: moderateScale(16),
    fontWeight: "600",
    color: "#333232",
    textAlign: "center",
  },
});
