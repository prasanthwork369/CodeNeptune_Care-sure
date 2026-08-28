import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  pill: {
    height: exactScale(52),
    backgroundColor: "#0F7635",
    borderRadius: exactScale(999),
    overflow: "hidden",
    boxShadow: "0px 4px 16px 0px rgba(0, 0, 0, 0.2)",
  },
  touchable: {
    width: "100%",
    height: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: exactScale(12),
    paddingRight: exactScale(16),
  },
  thumbnailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  fallbackPlaceholderBox: {
    width: exactScale(36),
    height: exactScale(36),
    borderRadius: exactScale(18),
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  textCol: {
    flex: 1,
    marginLeft: exactScale(10),
    justifyContent: "center",
  },
  viewCartText: {
    fontFamily: "Inter-Bold",
    fontWeight: "700",
    color: "#FFFFFF",
    fontSize: moderateScale(14.5),
    lineHeight: moderateScale(18),
  },
  chevronBox: {
    width: exactScale(28),
    height: exactScale(28),
    borderRadius: exactScale(14),
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
});
