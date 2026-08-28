import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: exactScale(12),
    borderTopRightRadius: exactScale(12),
  },
  contentContainer: {
    padding: exactScale(32),
  },
  title: {
    fontFamily: "Inter-Bold",
    fontWeight: "700",
    color: "#212B36",
    fontSize: moderateScale(18),
    marginBottom: exactScale(24),
  },
  listContainer: {
    gap: exactScale(16),
  },
  listItemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  bulletPoint: {
    fontFamily: "Inter-Regular",
    color: "#6A6A6A",
    fontSize: moderateScale(16),
    marginTop: exactScale(-2),
    marginRight: exactScale(8),
  },
  bulletText: {
    fontFamily: "Inter-Regular",
    color: "#6A6A6A",
    flex: 1,
    fontSize: moderateScale(12),
    lineHeight: moderateScale(24),
  },
});
