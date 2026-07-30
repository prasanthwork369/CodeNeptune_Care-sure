import { StyleSheet } from "react-native";
import { exactScale, moderateScale } from "@/src/utils/exactScale";

export const styles = StyleSheet.create({
  sectionTitle: { fontSize: moderateScale(14) },
  numberCircle: { width: exactScale(20), height: exactScale(20) },
  numberText: { fontSize: moderateScale(10) },
  itemLabel: { fontSize: moderateScale(13) },
  footerNote: { fontSize: moderateScale(12) },
});
