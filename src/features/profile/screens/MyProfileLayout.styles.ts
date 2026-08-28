import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F5F6FB",
  },
  scrollContent: {
    padding: exactScale(20),
    paddingBottom: exactScale(32),
  },
  dobRow: {
    flexDirection: "row",
    gap: exactScale(12),
    marginBottom: exactScale(16),
  },
  dobCol: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: moderateScale(13),
    fontWeight: "600",
    color: "#222222",
    marginBottom: exactScale(6),
  },
  pickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: exactScale(8),
    borderWidth: 1,
    borderColor: "#E8E8E8",
    paddingHorizontal: exactScale(14),
    height: exactScale(48),
  },
  pickerText: {
    flex: 1,
    fontSize: moderateScale(14),
    color: "#111827",
  },
  pickerPlaceholder: {
    flex: 1,
    fontSize: moderateScale(14),
    color: "#AAAAAA",
  },
  fieldError: {
    fontSize: moderateScale(12),
    fontWeight: "500",
    color: "#EF4444",
    marginTop: exactScale(4),
  },
  generalError: {
    fontSize: moderateScale(13),
    fontWeight: "500",
    color: "#EF4444",
    marginBottom: exactScale(12),
  },
  verifyText: {
    fontSize: moderateScale(13),
    fontWeight: "600",
    color: "#0F7635",
  },
  deleteCardWrapper: {
    marginTop: exactScale(24),
  },
  deleteCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: exactScale(8),
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#919EAB33",
  },
  deleteRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: exactScale(16),
    paddingVertical: exactScale(14),
  },
  deleteTitle: {
    fontFamily: "Inter-600SemiBold",
    fontWeight: "600",
    fontSize: moderateScale(14),
    color: "#CA2B25",
  },
  deleteDesc: {
    fontSize: moderateScale(12),
    color: "#6B7280",
    lineHeight: moderateScale(18),
    paddingTop: exactScale(4),
  },
  deleteArrowWrap: {
    marginLeft: exactScale(8),
    alignItems: "center",
    justifyContent: "center",
    width: exactScale(36),
    height: exactScale(36),
    borderRadius: exactScale(18),
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#919EAB33",
  },
  bottomArea: {
    backgroundColor: "#F5F6FB",
  },
  bottomPadding: {
    paddingHorizontal: exactScale(20),
    paddingTop: exactScale(12),
    paddingBottom: exactScale(12),
  },
  saveBtn: {
    backgroundColor: "#0F7635",
    borderRadius: exactScale(10),
    height: exactScale(52),
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnEnabled: {
    opacity: 1,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    fontSize: moderateScale(15),
    fontWeight: "600",
    color: "#FFFFFF",
  },
  genderSheetContent: {
    paddingHorizontal: exactScale(20),
    paddingTop: exactScale(24),
  },
  genderSheetTitle: {
    fontSize: moderateScale(16),
    fontWeight: "700",
    color: "#111827",
    marginBottom: exactScale(16),
  },
  genderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: exactScale(14),
  },
  genderLabel: {
    fontSize: moderateScale(15),
    color: "#111827",
    fontWeight: "400",
  },
  genderLabelActive: {
    fontSize: moderateScale(15),
    color: "#0F7635",
    fontWeight: "600",
  },
});
