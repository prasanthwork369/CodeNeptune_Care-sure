import { exactScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  saltBannerPad: {
    paddingHorizontal: exactScale(16),
    paddingVertical: exactScale(12),
  },
  boardPad: {
    paddingHorizontal: exactScale(16),
    paddingVertical: exactScale(24),
  },
  boardCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: exactScale(16),
    borderWidth: 1,
    borderColor: "#919EAB33",
    overflow: "hidden",
  },
  boardSplitRow: {
    flexDirection: "row",
  },
  boardLeftSide: {
    flex: 1,
    padding: exactScale(16),
    borderRightWidth: 1,
    borderRightColor: "#919EAB33",
  },
  boardRightSide: {
    flex: 1,
    padding: exactScale(16),
  },
  logisticsPad: {
    paddingHorizontal: exactScale(16),
    marginBottom: exactScale(24),
  },
  logisticsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: exactScale(12),
    borderWidth: 1,
    borderColor: "#919EAB33",
    padding: exactScale(16),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logisticsLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  trustPad: {
    paddingHorizontal: exactScale(16),
    marginBottom: exactScale(24),
  },
  moreAboutPad: {
    paddingHorizontal: exactScale(16),
    marginBottom: exactScale(80),
  },
});
