import { exactScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  itemTouchable: {
    paddingHorizontal: exactScale(16),
  },
  itemImage: {
    width: "100%",
    height: "100%",
    borderRadius: exactScale(16),
  },
  skeletonContainer: {
    paddingHorizontal: exactScale(16),
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: exactScale(8),
    gap: exactScale(6),
  },
});
