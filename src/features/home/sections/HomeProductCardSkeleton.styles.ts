import { exactScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  cardRoot: {
    backgroundColor: "#FFFFFF",
    borderRadius: exactScale(12),
    overflow: "hidden",
    borderWidth: 0.77,
    borderColor: "#919EAB33",
  },
  imageArea: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: exactScale(8),
    paddingBottom: exactScale(8),
    paddingTop: exactScale(28),
  },
  detailsArea: {
    backgroundColor: "#F2FFF9",
    flex: 1,
    paddingHorizontal: exactScale(12),
    paddingTop: exactScale(12),
  },
  line1: {
    marginBottom: exactScale(6),
  },
  line2: {
    marginBottom: exactScale(10),
  },
  pricesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: exactScale(8),
  },
  buttonArea: {
    backgroundColor: "#F2FFF9",
    paddingHorizontal: exactScale(12),
    paddingBottom: exactScale(12),
    paddingTop: exactScale(8),
  },
  scrollContent: {
    paddingLeft: exactScale(20),
    paddingRight: exactScale(40),
    gap: exactScale(14),
  },
});
