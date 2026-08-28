import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F5F6FB",
  },
  scrollContent: {
    alignItems: "center",
    paddingTop: exactScale(36),
    paddingBottom: exactScale(28),
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  promptText: {
    fontSize: moderateScale(14),
    fontWeight: "500",
    color: "#6B7280",
    marginBottom: exactScale(12),
  },
  inputTouchable: {
    width: "100%",
    alignItems: "center",
    marginBottom: exactScale(6),
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minWidth: exactScale(200),
    maxWidth: "92%",
    paddingHorizontal: exactScale(12),
    borderBottomWidth: 2,
    paddingBottom: exactScale(4),
    gap: exactScale(4),
  },
  currencySymbol: {
    fontSize: moderateScale(44),
    fontWeight: "800",
    color: "#111827",
  },
  textInput: {
    fontSize: moderateScale(44),
    lineHeight: moderateScale(54),
    fontWeight: "800",
    color: "#111827",
    minWidth: 100,
    minHeight: moderateScale(60),
    paddingHorizontal: exactScale(8),
    paddingVertical: 0,
    textAlignVertical: "center",
    includeFontPadding: false,
  },
  helperText: {
    fontSize: moderateScale(12),
    fontWeight: "500",
    marginTop: exactScale(6),
  },
  balanceLoader: {
    marginBottom: exactScale(20),
  },
  balanceText: {
    fontSize: moderateScale(13),
    fontWeight: "500",
    color: "#6B7280",
    marginBottom: exactScale(20),
  },
  balanceValueBold: {
    fontWeight: "700",
    color: "#111827",
  },
  presetRow: {
    flexDirection: "row",
    gap: exactScale(10),
    marginBottom: exactScale(12),
  },
  presetChip: {
    paddingHorizontal: exactScale(20),
    paddingVertical: exactScale(10),
    borderRadius: exactScale(8),
    borderWidth: 1.5,
  },
  presetChipText: {
    fontSize: moderateScale(14),
    fontWeight: "600",
  },
  maxLimitText: {
    fontSize: moderateScale(12),
    fontWeight: "500",
    color: "#9CA3AF",
  },
  spacer: {
    flex: 1,
  },
  bottomSafeArea: {
    backgroundColor: "#F5F6FB",
  },
  proceedWrap: {
    paddingHorizontal: exactScale(20),
    paddingTop: exactScale(12),
    paddingBottom: exactScale(12),
  },
  proceedBtn: {
    backgroundColor: "#0F7635",
    borderRadius: exactScale(14),
    height: exactScale(54),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: exactScale(8),
  },
  proceedBtnText: {
    fontSize: moderateScale(16),
    fontWeight: "600",
    color: "#FFFFFF",
  },
  confettiOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99,
  },
  confettiAnimation: {
    width: "100%",
    height: "100%",
  },
});
