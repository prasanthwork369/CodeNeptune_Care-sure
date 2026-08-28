import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: exactScale(16),
    paddingBottom: exactScale(8),
  },
  contentRow: {
    height: exactScale(48),
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: exactScale(44),
    height: exactScale(44),
    marginRight: exactScale(12),
    backgroundColor: "#FFFFFF",
    borderRadius: exactScale(22),
    borderWidth: 1,
    borderColor: "#919EAB33",
    alignItems: "center",
    justifyContent: "center",
  },
  titleText: {
    fontFamily: "Inter-Bold",
    fontWeight: "700",
    flex: 1,
    color: "#333232",
    fontSize: moderateScale(18),
  },
});
