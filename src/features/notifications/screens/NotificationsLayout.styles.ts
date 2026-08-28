import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  emptyCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptySubText: {
    fontFamily: "Inter-Regular",
    fontWeight: "400",
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: exactScale(4),
    fontSize: moderateScale(13),
  },
  listStyle: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
});
