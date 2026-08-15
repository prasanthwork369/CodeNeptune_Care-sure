import { StyleSheet } from "react-native";
import { exactScale, moderateScale } from "@/src/utils/exactScale";

export const styles = StyleSheet.create({
  sectionTitle: { fontSize: moderateScale(14) },
  stepCircle: { width: exactScale(32), height: exactScale(32) },
  stepNumber: { fontSize: moderateScale(14) },
  stepLabel: { fontSize: moderateScale(12), lineHeight: moderateScale(16) },
});
