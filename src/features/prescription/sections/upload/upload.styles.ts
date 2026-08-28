import { colors } from "@/src/constants/theme";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // Card base
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: exactScale(14),
    padding: exactScale(16),
    borderWidth: 1,
    borderColor: "#919EAB33",
  },

  // UploadActions
  actionsRow: {
    flexDirection: "row",
    gap: exactScale(12),
  },
  actionBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#919EAB33",
    borderRadius: exactScale(14),
    paddingVertical: exactScale(20),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFEF8",
  },
  actionIcon: {
    width: exactScale(28),
    height: exactScale(28),
  },
  actionLabel: {
    fontSize: moderateScale(12),
    fontWeight: "600",
    color: "#1A1C1E",
    marginTop: exactScale(8),
  },
  historySelectCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#919EAB33",
    borderRadius: exactScale(14),
    padding: exactScale(16),
    flexDirection: "row",
    alignItems: "center",
    marginVertical: exactScale(16),
  },
  historyIconBox: {
    width: exactScale(40),
    height: exactScale(40),
    borderRadius: exactScale(20),
    backgroundColor: "#E3F4F0",
    alignItems: "center",
    justifyContent: "center",
  },
  historyIcon: {
    width: exactScale(22),
    height: exactScale(22),
  },
  historyTextCol: {
    flex: 1,
    marginLeft: exactScale(12),
  },
  historyTitle: {
    fontSize: moderateScale(14),
    fontWeight: "500",
    color: "#0F2B22",
  },
  historyBadgeBox: {
    backgroundColor: "#F3FAF7",
    alignSelf: "flex-start",
    borderRadius: exactScale(4),
    paddingHorizontal: exactScale(8),
    paddingVertical: exactScale(2),
    marginTop: exactScale(4),
  },
  historyBadgeText: {
    fontSize: moderateScale(10),
    fontWeight: "700",
    letterSpacing: 0.8,
    color: colors.primary,
  },
  arrowIcon: {
    width: exactScale(14),
    height: exactScale(14),
  },
  historyHelperText: {
    fontSize: moderateScale(12),
    color: "#6A6A6A",
    fontWeight: "500",
  },

  // ValidPrescriptionInfo
  validRow: {
    flexDirection: "row",
  },
  sampleRxBox: {
    backgroundColor: "#F2FFFA",
    borderWidth: 1,
    borderColor: "#919EAB33",
    borderRadius: exactScale(12),
    alignItems: "center",
    justifyContent: "center",
  },
  validRightCol: {
    flex: 1,
    marginLeft: exactScale(16),
  },
  validSectionTitle: {
    fontSize: moderateScale(14),
    fontWeight: "700",
    color: "#1A1C1E",
    marginBottom: exactScale(8),
  },
  validItemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: exactScale(6),
  },
  numberCircle: {
    width: exactScale(18),
    height: exactScale(18),
    borderRadius: exactScale(9),
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: exactScale(8),
  },
  numberText: {
    fontSize: moderateScale(11),
    fontWeight: "700",
    color: "#FFFFFF",
    lineHeight: moderateScale(11),
  },
  validItemLabel: {
    fontSize: moderateScale(12),
    fontWeight: "500",
    color: "#1A1C1E",
  },
  dashedSeparator: {
    height: 2,
    marginVertical: exactScale(14),
  },
  footerNote: {
    fontSize: moderateScale(11),
    color: "#60646C",
    marginBottom: exactScale(4),
  },

  // HowItWorks
  howSectionTitle: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#1C2024",
    marginBottom: exactScale(16),
  },
  stepsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-around",
  },
  stepCol: {
    alignItems: "center",
    flex: 1,
  },
  stepCircle: {
    width: exactScale(32),
    height: exactScale(32),
    borderRadius: exactScale(16),
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumber: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#1C2024",
  },
  stepLabel: {
    fontSize: moderateScale(12),
    lineHeight: moderateScale(16),
    fontWeight: "500",
    color: "#1C2024",
    textAlign: "center",
    marginTop: exactScale(8),
  },

  // WhyTrustUs
  trustSectionTitle: {
    fontSize: moderateScale(14),
    fontWeight: "700",
    color: "#1A1C1E",
    marginBottom: exactScale(12),
  },
  trustItemRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  trustItemRowMargin: {
    marginTop: exactScale(12),
  },
  trustIcon: {
    width: exactScale(24),
    height: exactScale(24),
  },
  trustLabel: {
    fontSize: moderateScale(13),
    fontWeight: "600",
    color: "#0F1724",
    marginLeft: exactScale(12),
  },
});
