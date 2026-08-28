import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F5F6FB",
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    padding: exactScale(20),
  },
  sectionWrap: {
    marginBottom: exactScale(20),
  },
  typeLabel: {
    fontSize: moderateScale(13),
    fontWeight: "600",
    color: "#222222",
    marginBottom: exactScale(8),
  },
  typeRow: {
    flexDirection: "row",
    gap: exactScale(10),
  },
  typeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: exactScale(6),
    paddingHorizontal: exactScale(14),
    paddingVertical: exactScale(8),
    borderRadius: exactScale(6),
    borderWidth: 1,
  },
  typeChipActive: {
    backgroundColor: "#0F7635",
    borderColor: "#0F7635",
  },
  typeChipInactive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E8E8E8",
  },
  typeChipText: {
    fontSize: moderateScale(13),
    fontFamily: "Inter-600SemiBold",
    fontWeight: "600",
  },
  typeChipTextActive: {
    color: "#FFFFFF",
  },
  typeChipTextInactive: {
    color: "#6A6A6A",
  },
  defaultToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: exactScale(8),
    marginBottom: exactScale(24),
  },
  toggleTrack: {
    width: exactScale(44),
    height: exactScale(24),
    borderRadius: exactScale(12),
    padding: exactScale(2),
    justifyContent: "center",
    marginRight: exactScale(12),
  },
  toggleTrackActive: {
    backgroundColor: "#0F7635",
  },
  toggleTrackInactive: {
    backgroundColor: "#E0E0E0",
  },
  toggleThumb: {
    width: exactScale(20),
    height: exactScale(20),
    borderRadius: exactScale(10),
    backgroundColor: "#FFFFFF",
    shadowColor: "#919EAB33",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  defaultText: {
    fontSize: moderateScale(14),
    fontFamily: "Inter-600SemiBold",
    fontWeight: "600",
    color: "#222222",
  },
  errorText: {
    fontSize: moderateScale(13),
    color: "#EF4444",
    fontFamily: "Inter-500Medium",
    marginBottom: exactScale(12),
  },
  bottomArea: {
    backgroundColor: "#F5F6FB",
  },
  bottomPadding: {
    paddingHorizontal: exactScale(20),
    paddingTop: exactScale(12),
    paddingBottom: exactScale(12),
  },
  submitBtn: {
    backgroundColor: "#0F7635",
    borderRadius: exactScale(6),
    paddingVertical: exactScale(16),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: exactScale(8),
  },
  submitBtnEnabled: {
    opacity: 1,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    fontSize: moderateScale(15),
    fontFamily: "Inter-600SemiBold",
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
