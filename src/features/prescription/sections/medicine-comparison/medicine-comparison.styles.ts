import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const COLUMN_PADDING = exactScale(14);
export const IMAGE_BOX = exactScale(76);
export const QTY_PILL_HEIGHT = exactScale(30);

export const styles = StyleSheet.create({
  // ComparisonTabHeader
  tabHeaderRoot: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  tabHeaderLeft: {
    flex: 1,
    paddingVertical: exactScale(12),
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  tabHeaderLeftText: {
    fontSize: moderateScale(13),
    fontWeight: "500",
    color: "#6B7280",
  },
  tabHeaderRight: {
    flex: 1,
    paddingVertical: exactScale(12),
    alignItems: "center",
    backgroundColor: "#E8F5EC",
  },
  tabHeaderRightText: {
    fontSize: moderateScale(13),
    fontWeight: "600",
    color: "#0F7635",
  },

  // ComparisonCard
  cardRoot: {
    borderRadius: exactScale(16),
    borderWidth: 1,
    borderColor: "#919EAB33",
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
  saltBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: COLUMN_PADDING,
    paddingTop: exactScale(12),
    paddingBottom: exactScale(6),
    gap: exactScale(6),
    borderTopLeftRadius: exactScale(15),
    borderTopRightRadius: exactScale(15),
  },
  saltBadgeText: {
    fontSize: moderateScale(11),
    fontWeight: "500",
    color: "#6B7280",
    letterSpacing: 0.4,
  },
  saltCompositionText: {
    fontSize: moderateScale(13),
    fontWeight: "600",
    color: "#111827",
    paddingHorizontal: COLUMN_PADDING,
    paddingBottom: exactScale(12),
  },
  bodyTableWrapper: {
    borderTopWidth: 1,
    borderColor: "#919EAB33",
  },
  backgroundSplitOverlay: {
    flexDirection: "row",
  },
  bgLeftPrescribed: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRightWidth: 1,
    borderRightColor: "#919EAB33",
    borderBottomLeftRadius: exactScale(15),
  },
  bgRightRecommended: {
    flex: 1,
    borderBottomRightRadius: exactScale(15),
  },
  tableRowsContent: {
    paddingVertical: COLUMN_PADDING,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableCol: {
    flex: 1,
    paddingHorizontal: COLUMN_PADDING,
  },
  imageBoxBase: {
    borderRadius: exactScale(10),
    borderWidth: 1,
    width: IMAGE_BOX,
    height: IMAGE_BOX,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
    overflow: "hidden",
  },
  imageBoxPrescribed: {
    borderColor: "#919EAB33",
    backgroundColor: "#F9FAFB",
  },
  imageBoxRecommended: {
    borderColor: "#D3ECB0",
    backgroundColor: "#FFFFFF",
  },
  medName: {
    fontSize: moderateScale(15),
    fontWeight: "700",
    color: "#111827",
    lineHeight: moderateScale(20),
  },
  prescribedMfg: {
    fontSize: moderateScale(12),
    fontWeight: "500",
    color: "#6B7280",
  },
  recommendedMfg: {
    fontSize: moderateScale(12),
    fontWeight: "500",
    color: "#009989",
  },
  packSizeText: {
    fontSize: moderateScale(12),
    fontWeight: "400",
    color: "#6B7280",
  },
  priceRow: {
    flexDirection: "row",
    marginTop: exactScale(12),
  },
  priceColPrescribed: {
    flex: 1,
    paddingHorizontal: COLUMN_PADDING,
    justifyContent: "center",
    minHeight: QTY_PILL_HEIGHT,
  },
  priceColRecommended: {
    flex: 1,
    paddingHorizontal: COLUMN_PADDING,
    flexDirection: "row",
    alignItems: "center",
    minHeight: QTY_PILL_HEIGHT,
    gap: exactScale(4),
  },
  priceBold: {
    fontSize: moderateScale(18),
    fontWeight: "800",
    color: "#111827",
  },
  mrpStrike: {
    fontSize: moderateScale(12),
    fontWeight: "500",
    color: "#9CA3AF",
    textDecorationLine: "line-through",
  },
  qtyPill: {
    marginLeft: "auto",
    borderRadius: exactScale(8),
    backgroundColor: "#F4F6F8",
    height: QTY_PILL_HEIGHT,
    paddingHorizontal: exactScale(10),
    alignItems: "center",
    justifyContent: "center",
  },
  qtyPillText: {
    fontSize: moderateScale(13),
    fontWeight: "600",
    color: "#111827",
  },
  discountRibbonWrap: {
    position: "absolute",
    top: 0,
    right: exactScale(12),
    width: exactScale(38),
    height: exactScale(42),
    zIndex: 10,
  },
  discountRibbonImg: {
    width: exactScale(38),
    height: exactScale(42),
  },
  discountRibbonTextWrap: {
    position: "absolute",
    top: exactScale(2),
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  discountPercentText: {
    fontSize: moderateScale(11),
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: moderateScale(12),
  },
  discountOffText: {
    fontSize: moderateScale(8),
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: moderateScale(9),
    marginTop: exactScale(1),
  },

  // RefillReminder
  refillReminderRoot: {
    marginHorizontal: exactScale(16),
    marginTop: exactScale(12),
    backgroundColor: "#FFFFFF",
    borderRadius: exactScale(12),
    borderWidth: 1,
    borderColor: "#919EAB33",
    paddingHorizontal: exactScale(16),
    paddingTop: exactScale(14),
  },
  refillHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  clockIcon: {
    width: exactScale(36),
    height: exactScale(36),
  },
  refillTextCol: {
    flex: 1,
    marginLeft: exactScale(12),
  },
  refillTitle: {
    fontSize: moderateScale(14),
    fontWeight: "700",
    color: "#111827",
  },
  refillSubtitle: {
    fontSize: moderateScale(12),
    fontWeight: "500",
    color: "#6B7280",
    marginTop: exactScale(2),
  },
  refillNote: {
    fontSize: moderateScale(12),
    fontWeight: "500",
    color: "#6B7280",
    marginTop: exactScale(10),
  },

  // SavingsBanner
  savingsBannerGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: exactScale(16),
    paddingVertical: exactScale(12),
    gap: exactScale(10),
  },
  savingsTagIcon: {
    width: exactScale(32),
    height: exactScale(32),
  },
  savingsText: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#0A0A0A",
  },
  savingsAmountBold: {
    fontWeight: "800",
  },
});
