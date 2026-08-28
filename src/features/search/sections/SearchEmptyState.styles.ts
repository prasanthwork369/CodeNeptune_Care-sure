import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: exactScale(32),
  },
  text: {
    fontFamily: "Inter-SemiBold",
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
    fontSize: moderateScale(15),
  },
});
