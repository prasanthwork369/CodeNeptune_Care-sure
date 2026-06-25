import { StyleSheet } from "react-native";
import { exactScale } from "@/src/utils/exactScale";

export const styles = StyleSheet.create({
  wrap: { paddingBottom: exactScale(16) },
  icon: { width: exactScale(15), height: exactScale(15) },
  secureText: {
    fontSize: exactScale(13),
    fontWeight: "500",
    color: "#637381",
  },
  policyText: {
    fontSize: exactScale(12),
    fontWeight: "500",
    color: "#637381",
    textAlign: "center",
    paddingHorizontal: 8,
    lineHeight: exactScale(20),
  },
  link: {
    color: "#0F7635",
    fontWeight: "500",
    textDecorationLine: "underline",
    fontSize: exactScale(12)
  },
});
