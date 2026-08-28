import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  cardRoot: {
    marginBottom: exactScale(16),
    borderRadius: exactScale(12),
    backgroundColor: "#FFFFFF",
    padding: exactScale(16),
    borderWidth: 1.05,
    borderColor: "#919EAB33",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  leftCol: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
  },
  thumbnailBox: {
    width: exactScale(56),
    height: exactScale(56),
    borderRadius: exactScale(4),
    borderWidth: 1,
    borderColor: "#919EAB1A",
    backgroundColor: "#F1F0F5",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginRight: exactScale(12),
  },
  thumbImage: {
    width: "100%",
    height: "100%",
  },
  textCol: {
    flex: 1,
  },
  itemId: {
    fontSize: moderateScale(15),
    fontWeight: "700",
    color: "#222222",
  },
  patientName: {
    fontSize: moderateScale(13),
    fontWeight: "500",
    color: "#6A6A6A",
    marginTop: exactScale(2),
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: exactScale(4),
    marginLeft: exactScale(8),
  },
  statusText: {
    fontSize: moderateScale(12),
    fontWeight: "600",
  },
  statusDescRow: {
    flexDirection: "row",
    marginTop: exactScale(16),
    gap: exactScale(10),
  },
  pillIconBox: {
    alignItems: "center",
    justifyContent: "center",
    width: exactScale(24),
    height: exactScale(24),
    borderRadius: exactScale(4),
    backgroundColor: "#F1F0F5",
    padding: exactScale(4),
  },
  descTouch: {
    flex: 1,
  },
  descText: {
    fontSize: moderateScale(13),
    lineHeight: moderateScale(16),
    fontWeight: "500",
    color: "#4A4A4A",
  },
  viewMoreLink: {
    fontSize: moderateScale(12),
    fontWeight: "600",
    color: "#C22307",
    marginTop: exactScale(4),
  },
  dashedDivider: {
    marginVertical: exactScale(20),
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
  },
  viewPrescriptionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: exactScale(14),
    backgroundColor: "#F1FEF8",
    borderWidth: 1,
    borderColor: "#0F763522",
    borderRadius: exactScale(14),
  },
  viewPrescriptionText: {
    color: "#0F7635",
    fontSize: moderateScale(13),
    fontWeight: "700",
    letterSpacing: 0.8,
    marginRight: exactScale(6),
  },
  uploadedDateText: {
    paddingTop: exactScale(8),
    fontSize: moderateScale(12),
    fontWeight: "500",
    color: "#6A6A6A",
    marginTop: exactScale(10),
  },
});
