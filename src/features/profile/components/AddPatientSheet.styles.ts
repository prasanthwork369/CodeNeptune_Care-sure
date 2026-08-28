import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: "#fff",
    borderTopLeftRadius: exactScale(12),
    borderTopRightRadius: exactScale(12),
  },
  sheetScroll: {
    flex: 1,
    paddingHorizontal: exactScale(20),
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: exactScale(20),
  },
  title: {
    fontSize: moderateScale(18),
    fontFamily: "Inter-600SemiBold",
    fontWeight: "600",
    color: "#222222",
  },
  submitBtn: {
    backgroundColor: "#0F7635",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 16,
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
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 8,
    marginBottom: 16,
  },
  deleteBtnText: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#EF4444",
  },
});
