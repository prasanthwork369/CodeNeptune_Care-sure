import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    height: "100%",
  },
  scrollContent: {
    flexGrow: 1,
  },
  skeletonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: exactScale(10),
  },
  gridContainer: {
    gap: exactScale(14),
  },
  gridRow: {
    flexDirection: "row",
    gap: exactScale(10),
  },
  cardTouchable: {
    alignItems: "center",
  },
  imageContainer: {
    backgroundColor: "#EDF4FE",
    borderRadius: exactScale(12),
    alignItems: "center",
    justifyContent: "center",
    padding: exactScale(2),
    position: "relative",
  },
  cardImage: {
    width: "92%",
    height: "92%",
    position: "absolute",
  },
  cardLabel: {
    fontFamily: "Inter-SemiBold",
    fontWeight: "600",
    fontSize: moderateScale(11),
    lineHeight: moderateScale(14),
    textAlign: "center",
    color: "#1E293B",
    marginTop: exactScale(6),
  },
});
