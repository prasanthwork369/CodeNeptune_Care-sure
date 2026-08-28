import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F5F6FB",
  },
  searchWrap: {
    paddingHorizontal: exactScale(16),
    paddingTop: exactScale(32),
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: exactScale(16),
    paddingTop: exactScale(18),
    paddingBottom: exactScale(40),
  },
  sectionTitle: {
    fontSize: moderateScale(16),
    lineHeight: moderateScale(21),
    marginBottom: exactScale(14),
    fontFamily: "Inter-700Bold",
    color: "#222222",
  },
  emptyText: {
    fontSize: moderateScale(13),
    fontFamily: "Inter-500Medium",
    color: "#6A6A6A",
    textAlign: "center",
    marginTop: exactScale(16),
  },
});
