import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  sheetCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: exactScale(32),
    borderTopRightRadius: exactScale(32),
    overflow: "hidden",
  },
  scrollContent: {
    alignItems: "center",
    paddingTop: exactScale(28),
    paddingHorizontal: exactScale(24),
  },
  handle: {
    width: exactScale(40),
    height: exactScale(4),
    borderRadius: exactScale(2),
    backgroundColor: "#E5E7EB",
    marginBottom: exactScale(24),
  },
  lottie: {
    width: exactScale(160),
    height: exactScale(160),
  },
  title: {
    fontSize: moderateScale(22),
    fontWeight: "800",
    color: "#0F1724",
    marginTop: exactScale(8),
    textAlign: "center",
  },
  subtitle: {
    fontSize: moderateScale(14),
    color: "#6A6A6A",
    marginTop: exactScale(6),
    textAlign: "center",
    lineHeight: moderateScale(20),
  },
  summaryBox: {
    width: "100%",
    marginTop: exactScale(24),
    backgroundColor: "#F8FFF9",
    borderRadius: exactScale(16),
    borderWidth: 1,
    borderColor: "#0F763522",
    padding: exactScale(16),
    gap: exactScale(12),
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: moderateScale(13),
    fontWeight: "500",
    color: "#6A6A6A",
  },
  summaryValueDark: {
    fontSize: moderateScale(13),
    fontWeight: "700",
    color: "#1A1C1E",
  },
  summaryValueGreen: {
    fontSize: moderateScale(13),
    fontWeight: "700",
    color: "#0F7635",
  },
  btnWrap: {
    width: "100%",
    marginTop: exactScale(24),
    gap: exactScale(12),
  },
  trackBtn: {
    backgroundColor: "#0F7635",
    borderRadius: exactScale(14),
    paddingVertical: exactScale(16),
    alignItems: "center",
  },
  trackBtnText: {
    fontSize: moderateScale(15),
    fontWeight: "700",
    color: "#fff",
  },
  continueBtn: {
    borderRadius: exactScale(14),
    paddingVertical: exactScale(14),
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: exactScale(6),
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  continueBtnText: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#374151",
  },
});
