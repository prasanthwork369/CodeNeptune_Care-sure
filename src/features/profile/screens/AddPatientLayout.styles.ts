import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F5F6FB",
  },
  avoidingView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: exactScale(20),
    paddingTop: exactScale(16),
  },
  bottomBar: {
    paddingHorizontal: exactScale(20),
    paddingTop: exactScale(12),
    backgroundColor: "#F5F6FB",
  },
  submitBtn: {
    backgroundColor: "#0F7635",
    borderRadius: exactScale(12),
    paddingVertical: exactScale(14),
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtnEnabled: {
    opacity: 1,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    fontSize: moderateScale(15),
    fontWeight: "700",
    color: "#fff",
  },
});
