import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: exactScale(16),
    marginTop: exactScale(20),
    rowGap: exactScale(12),
  },
  cardLabel: {
    fontSize: moderateScale(13),
    paddingHorizontal: exactScale(8),
    paddingTop: exactScale(10),
  },
});
