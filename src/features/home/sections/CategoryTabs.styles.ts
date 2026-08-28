import { exactScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  root: {
    borderBottomWidth: 1,
    borderBottomColor: "#919EAB33",
  },
  skeletonScroll: {
    paddingHorizontal: exactScale(16),
    paddingTop: exactScale(4),
    paddingBottom: exactScale(12),
    gap: exactScale(32),
  },
  skeletonItem: {
    alignItems: "center",
    gap: exactScale(8),
  },
  scrollContent: {
    paddingHorizontal: exactScale(16),
    paddingTop: exactScale(4),
    paddingBottom: 0,
    alignItems: "flex-end",
  },
  activeIndicator: {
    height: exactScale(5),
    position: "absolute",
    bottom: 0,
    borderTopLeftRadius: exactScale(8),
    borderTopRightRadius: exactScale(8),
    backgroundColor: "#107539",
  },
});
