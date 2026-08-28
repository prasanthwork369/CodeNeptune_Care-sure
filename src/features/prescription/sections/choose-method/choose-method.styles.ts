import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // RadioButton
  radioCircle: {
    width: exactScale(22),
    height: exactScale(22),
    borderRadius: exactScale(11),
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  radioDot: {
    width: exactScale(11),
    height: exactScale(11),
    borderRadius: exactScale(5.5),
    backgroundColor: "#0F7635",
  },

  // CallMethodCard
  callCardWrapper: {
    borderRadius: exactScale(14),
    borderWidth: 1,
    borderColor: "#919EAB33",
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
  cardGradient: {
    padding: exactScale(14),
  },
  badge: {
    backgroundColor: "#D0ECFD",
    alignSelf: "flex-start",
    marginBottom: exactScale(12),
    borderRadius: exactScale(4),
    paddingHorizontal: exactScale(8),
    paddingVertical: exactScale(2),
  },
  badgeText: {
    color: "#1A1C1E",
    fontSize: moderateScale(10),
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  cardContentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardLeftCol: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
    paddingRight: exactScale(16),
  },
  stethoscopeIconBox: {
    width: exactScale(44),
    height: exactScale(44),
    alignItems: "center",
    justifyContent: "center",
  },
  stethoscopeIcon: {
    width: exactScale(36),
    height: exactScale(36),
  },
  prescriptionIcon: {
    width: exactScale(30),
    height: exactScale(30),
  },
  cardTextCol: {
    flex: 1,
    marginLeft: exactScale(12),
  },
  cardTitle: {
    fontWeight: "700",
    color: "#1A1C1E",
    fontSize: moderateScale(14),
  },
  cardDesc: {
    fontWeight: "500",
    color: "#6A6A6A",
    marginTop: exactScale(2),
    fontSize: moderateScale(12),
    lineHeight: moderateScale(17),
  },

  // UploadMethodCard
  uploadCardGradient: {
    borderRadius: exactScale(14),
    borderWidth: 1,
    borderColor: "#919EAB33",
    padding: exactScale(14),
  },

  // RequiresPrescriptionWarning
  warningCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#919EAB22",
    borderWidth: 1,
    padding: exactScale(12),
    borderRadius: exactScale(6),
  },
  warningHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: exactScale(8),
  },
  warningIconBox: {
    width: exactScale(18),
    height: exactScale(18),
    borderRadius: exactScale(10),
    backgroundColor: "#E56F07",
    alignItems: "center",
    justifyContent: "center",
    marginRight: exactScale(8),
  },
  warningIconText: {
    color: "#FFFFFF",
    fontSize: moderateScale(12),
    fontWeight: "700",
    lineHeight: moderateScale(14),
  },
  warningHeaderText: {
    color: "#E56F07",
    fontSize: moderateScale(13),
    fontWeight: "700",
  },
  warningItemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginLeft: exactScale(4),
    marginBottom: exactScale(2),
  },
  warningBulletText: {
    color: "#6A6A6A",
    marginRight: exactScale(6),
    lineHeight: moderateScale(18),
  },
  warningItemName: {
    color: "#6A6A6A",
    fontSize: moderateScale(12),
    lineHeight: moderateScale(18),
    fontWeight: "500",
    flex: 1,
  },

  // ChooseMethodFooter
  footerContent: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: undefined,
  },
  toPayLabel: {
    fontWeight: "500",
    color: "#1C2024",
    fontSize: moderateScale(11),
  },
  toPayAmount: {
    fontWeight: "800",
    color: "#1C2024",
    fontSize: moderateScale(18),
  },
  proceedBtn: {
    flex: 1,
    marginLeft: exactScale(40),
  },
});
