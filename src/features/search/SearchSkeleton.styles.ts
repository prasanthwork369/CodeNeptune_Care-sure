import { exactScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: exactScale(100),
  },
  headerRow: {
    flexDirection: "row",
    marginHorizontal: exactScale(16),
    marginTop: exactScale(8),
    marginBottom: exactScale(16),
  },
  headerCell: {
    flex: 1,
    alignItems: "center",
  },
  itemWrapper: {
    paddingHorizontal: exactScale(16),
    marginBottom: exactScale(20),
  },
  cardRoot: {
    width: "100%",
    borderRadius: exactScale(12),
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#919EAB33",
  },
  splitRow: {
    flexDirection: "row",
    width: "100%",
  },
  sidePad: {
    flex: 1,
    padding: exactScale(16),
  },
  topCol: {
    marginBottom: exactScale(24),
  },
  bottomAuto: {
    marginTop: "auto",
  },
  divider: {
    height: 1,
    width: "100%",
    backgroundColor: "#EAEAEA",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: exactScale(16),
    paddingVertical: exactScale(14),
    backgroundColor: "#FFFFFF",
  },
  bottomLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  priceBaseRow: {
    flexDirection: "row",
    alignItems: "baseline",
    columnGap: exactScale(8),
    marginBottom: exactScale(6),
  },
});
