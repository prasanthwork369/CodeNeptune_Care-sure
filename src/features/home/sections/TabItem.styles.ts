import { StyleSheet } from "react-native";
import { exactScale, moderateScale } from "@/src/utils/exactScale";

export const styles = StyleSheet.create({
  iconWrap: { width: exactScale(40), height: exactScale(40) },
  icon: { width: exactScale(28), height: exactScale(28) },
  emoji: { fontSize: moderateScale(28) },
  label: { fontSize: moderateScale(13) },
});
