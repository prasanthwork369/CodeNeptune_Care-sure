import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // SectionCard
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: exactScale(8),
    marginHorizontal: exactScale(16),
    borderWidth: 1,
    borderColor: "#F0F1F3",
    elevation: 0,
  },

  // DeliveryAddressSection
  deliveryCard: {
    paddingHorizontal: exactScale(16),
    paddingVertical: exactScale(16),
  },
  sectionTitle: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#1C2024",
    marginBottom: exactScale(12),
  },
  addressCol: {
    gap: exactScale(2),
  },
  addressName: {
    fontSize: moderateScale(13),
    fontWeight: "700",
    color: "#1C2024",
  },
  addressDetails: {
    fontSize: moderateScale(13),
    color: "#60646C",
    lineHeight: moderateScale(18),
    marginTop: exactScale(4),
  },
  addressPhone: {
    fontSize: moderateScale(13),
    color: "#60646C",
  },
  emptyText: {
    fontSize: moderateScale(13),
    color: "#60646C",
  },

  // PaymentMethodSection
  paymentMethodRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: exactScale(12),
  },
  paymentIconBox: {
    width: exactScale(40),
    height: exactScale(40),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  paymentTitle: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#1C2024",
  },
  paymentSubtitle: {
    fontSize: moderateScale(13),
    fontWeight: "500",
    color: "#60646C",
  },

  // TrackingStatusBanner
  statusBanner: {
    marginHorizontal: exactScale(16),
    borderRadius: exactScale(6),
    borderWidth: 1,
    paddingHorizontal: exactScale(16),
    paddingVertical: exactScale(12),
  },
  bannerCancelled: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  bannerDelayed: {
    backgroundColor: "#FFFBE8",
    borderColor: "#FDE047",
  },
  bannerTitle: {
    fontSize: moderateScale(13),
    fontWeight: "600",
  },
  bannerTitleCancelled: {
    color: "#DC2626",
  },
  bannerTitleDelayed: {
    color: "#92600A",
  },
  bannerDesc: {
    fontSize: moderateScale(12),
    color: "#92600A",
    marginTop: exactScale(4),
  },

  // SavingsBreakdownSection
  savingsWrapper: {
    marginHorizontal: exactScale(16),
    borderRadius: exactScale(8),
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#919EAB33",
    backgroundColor: "#FFFFFF",
  },
  savingsHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: exactScale(16),
    paddingVertical: exactScale(12),
  },
  savingsHeaderTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: exactScale(8),
  },
  savingsHeaderTitle: {
    fontSize: moderateScale(14),
    fontWeight: "700",
    color: "#1C2024",
  },
  savingsPillGradient: {
    borderRadius: exactScale(6),
    overflow: "hidden",
  },
  savingsPillInner: {
    paddingHorizontal: exactScale(10),
    paddingVertical: exactScale(4),
  },
  savingsPillText: {
    fontSize: moderateScale(13),
    fontWeight: "700",
    color: "#FFFFFF",
  },
  savingsBreakdownContent: {
    paddingHorizontal: exactScale(16),
    paddingVertical: exactScale(8),
  },
  discountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: exactScale(8),
  },
  discountLabel: {
    fontSize: moderateScale(13),
    fontWeight: "500",
    color: "#6A6A6A",
  },
  discountValue: {
    fontSize: moderateScale(13),
    fontWeight: "600",
    color: "#0F7635",
  },

  // PrescriptionSection
  rxSectionTitle: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#0F1724",
    marginBottom: exactScale(12),
  },
  rxCardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rxDetailsRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: exactScale(12),
    marginRight: exactScale(8),
  },
  rxIconBox: {
    backgroundColor: "#FFFFFF",
    borderWidth: exactScale(1),
    borderColor: "#919EAB33",
    width: exactScale(40),
    height: exactScale(40),
    borderRadius: exactScale(4),
    alignItems: "center",
    justifyContent: "center",
  },
  rxTextCol: {
    flex: 1,
  },
  rxAttachedTitle: {
    fontSize: moderateScale(13),
    fontWeight: "700",
    color: "#0F1724",
  },
  rxVerifiedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: exactScale(4),
    marginTop: exactScale(2),
  },
  rxVerifiedText: {
    fontSize: moderateScale(13),
    fontWeight: "500",
    color: "#16A34A",
  },
  viewRxBtn: {
    backgroundColor: "#FFFFFF",
    borderWidth: exactScale(1),
    borderColor: "#00000014",
    borderRadius: exactScale(6),
    paddingHorizontal: exactScale(16),
    paddingVertical: exactScale(6),
  },
  viewRxBtnText: {
    fontSize: moderateScale(13),
    fontWeight: "600",
    color: "#0F1724",
  },

  // ReturnStatusSection
  returnStatusList: {
    gap: exactScale(8),
  },
  returnStatusBadge: {
    alignSelf: "flex-start",
    borderRadius: exactScale(4),
    borderWidth: 1,
    paddingHorizontal: exactScale(10),
    paddingVertical: exactScale(6),
  },
  returnStatusBadgeText: {
    fontSize: moderateScale(11),
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  windowExpiredText: {
    fontSize: moderateScale(12),
    fontWeight: "500",
    color: "#60646C",
  },

  // ItemsOrderedSection
  itemsHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: exactScale(16),
    paddingTop: exactScale(16),
    paddingBottom: exactScale(12),
  },
  itemsHeaderTitle: {
    fontSize: moderateScale(14),
    fontWeight: "700",
    color: "#1C2024",
  },
  actionBtnsRow: {
    flexDirection: "row",
    gap: exactScale(8),
  },
  returnBtnCol: {
    alignItems: "flex-end",
    gap: exactScale(4),
  },
  returnBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: exactScale(1.33),
    borderColor: "#FDE047",
    backgroundColor: "#FEF9C3",
    borderRadius: exactScale(20),
    paddingHorizontal: exactScale(12),
    paddingVertical: exactScale(4),
  },
  returnBtnText: {
    fontSize: moderateScale(13),
    fontWeight: "600",
    color: "#1C2024",
    marginLeft: exactScale(6),
  },
  returnDeadlineBadge: {
    fontSize: moderateScale(11),
    fontWeight: "500",
    color: "#60646C",
  },
  activeReturnPill: {
    borderWidth: exactScale(1.33),
    borderColor: "#E5E7EB",
    backgroundColor: "#F3F4F6",
    borderRadius: exactScale(20),
    paddingHorizontal: exactScale(12),
    paddingVertical: exactScale(4),
  },
  activeReturnPillText: {
    fontSize: moderateScale(13),
    fontWeight: "600",
    color: "#6A6A6A",
  },
  cancelBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: exactScale(1.33),
    borderColor: "#515F0014",
    backgroundColor: "#FFFFDC",
    borderRadius: exactScale(20),
    paddingHorizontal: exactScale(12),
    paddingVertical: exactScale(4),
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: exactScale(5.33) },
    shadowOpacity: 0.05,
    shadowRadius: exactScale(32),
  },
  cancelBtnText: {
    fontSize: moderateScale(13),
    fontWeight: "600",
    color: "#1C2024",
    marginLeft: exactScale(6),
  },
  itemRow: {
    flexDirection: "row",
    paddingHorizontal: exactScale(16),
    paddingVertical: exactScale(12),
  },
  itemImageBox: {
    borderWidth: 1,
    borderColor: "#919EAB33",
    backgroundColor: "#FAFAFA",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    width: exactScale(72),
    height: exactScale(72),
    borderRadius: exactScale(8),
    marginRight: exactScale(12),
  },
  itemImg: {
    width: exactScale(50),
    height: exactScale(50),
  },
  itemInfoCol: {
    flex: 1,
  },
  itemTitlePriceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  itemNameText: {
    fontSize: moderateScale(13),
    fontWeight: "600",
    color: "#1C2024",
    flex: 1,
    paddingRight: exactScale(8),
  },
  itemPriceCol: {
    alignItems: "flex-end",
  },
  itemSellingPrice: {
    fontSize: moderateScale(13),
    fontWeight: "700",
    color: "#1C2024",
  },
  itemMrpPrice: {
    fontSize: moderateScale(11),
    color: "#60646C",
    textDecorationLine: "line-through",
    marginTop: exactScale(2),
  },
  itemMetaText: {
    fontSize: moderateScale(13),
    fontWeight: "500",
    color: "#60646C",
    marginTop: exactScale(2),
  },
  itemQtyDiscountRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: exactScale(8),
  },
  qtyBadge: {
    borderWidth: exactScale(1),
    borderColor: "#E2E8F0",
    backgroundColor: "#F3F4F6",
    borderRadius: exactScale(4),
    paddingHorizontal: exactScale(10),
    paddingVertical: exactScale(2),
  },
  qtyBadgeText: {
    fontSize: moderateScale(11),
    fontWeight: "600",
    color: "#1C2024",
  },
  discountPercentText: {
    fontSize: moderateScale(13),
    fontWeight: "700",
    color: "#0F7635",
  },
  itemDivider: {
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
    marginHorizontal: exactScale(20),
    borderStyle: "dashed",
  },
});
