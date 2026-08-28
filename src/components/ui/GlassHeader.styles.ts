import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: exactScale(16),
    paddingBottom: exactScale(8),
    zIndex: 20,
  },
  contentRow: {
    height: exactScale(48),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: exactScale(44),
    height: exactScale(44),
    marginRight: exactScale(12),
    borderRadius: exactScale(22),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderWidth: 1,
    borderColor: "rgba(145, 158, 171, 0.25)",
    boxShadow: "0px 2px 6px 0px rgba(0, 0, 0, 0.05)",
  },
  titleText: {
    fontFamily: "Inter-Bold",
    fontWeight: "700",
    flex: 1,
    color: "#1F2937",
    fontSize: moderateScale(18),
  },
});
