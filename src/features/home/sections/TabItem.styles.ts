import { StyleSheet } from "react-native";
import { exactScale, moderateScale } from "@/src/utils/exactScale";

export const styles = StyleSheet.create({
  iconWrap: {
    width: exactScale(36),
    height: exactScale(32),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: exactScale(2),
  },
  icon: { width: exactScale(30), height: exactScale(30) },
  emoji: { fontSize: moderateScale(26) },
  label: { fontSize: moderateScale(13) },
});
