import { exactScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  list: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  heroUnderlay: {
    position: "absolute",
    left: 0,
    right: 0,
    height: exactScale(400),
    backgroundColor: "#DEF5B0",
  },
  heroGradient: {
    position: "absolute",
    left: 0,
    right: 0,
  },
  searchSection: {
    paddingBottom: exactScale(14),
    paddingHorizontal: exactScale(36),
    backgroundColor: "transparent",
  },
  searchUploadSlot: {
    borderLeftWidth: 1,
    borderLeftColor: "#919EAB33",
    paddingLeft: exactScale(12),
    marginLeft: exactScale(4),
  },
  quickActionsWrap: {
    marginTop: exactScale(5),
  },
  sectionGap10: {
    marginTop: exactScale(10),
  },
  sectionGap20: {
    marginTop: exactScale(20),
  },
});
