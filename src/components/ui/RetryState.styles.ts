import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: exactScale(32),
    paddingVertical: exactScale(48),
  },
  titleText: {
    fontFamily: "Inter-SemiBold",
    fontWeight: "600",
    color: "#222222",
    textAlign: "center",
    fontSize: moderateScale(17),
  },
  messageText: {
    fontFamily: "Inter-Regular",
    fontWeight: "400",
    color: "#6A6A6A",
    textAlign: "center",
    fontSize: moderateScale(13),
    marginTop: exactScale(6),
  },
  button: {
    width: exactScale(120),
    marginTop: exactScale(18),
  },
});
