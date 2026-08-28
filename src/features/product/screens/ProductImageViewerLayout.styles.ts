import { exactScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const THUMB_SIZE = exactScale(56);

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F5F6FB",
  },
  zoomableContainer: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  listContainer: {
    flex: 1,
    overflow: "hidden",
  },
  thumbnailStrip: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#EEEFF1",
    paddingVertical: exactScale(12),
  },
  thumbScrollContent: {
    paddingHorizontal: exactScale(16),
    gap: exactScale(10),
  },
  thumbWrapper: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: exactScale(8),
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  thumbWrapperActive: {
    borderWidth: 2,
    borderColor: "#0F7635",
  },
  thumbImage: {
    width: "100%",
    height: "100%",
  },
});
