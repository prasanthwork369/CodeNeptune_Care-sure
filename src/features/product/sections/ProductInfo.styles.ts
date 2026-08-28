import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  root: {
    backgroundColor: "transparent",
    paddingTop: exactScale(16),
    paddingBottom: exactScale(16),
  },
  carouselWrap: {
    marginBottom: exactScale(32),
  },
  carouselItemContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: exactScale(16),
    gap: exactScale(6),
  },
  contentPad: {
    paddingHorizontal: exactScale(20),
  },
  manufacturerText: {
    fontFamily: "Inter-SemiBold",
    fontWeight: "600",
    color: "#009989",
    marginBottom: exactScale(4),
    fontSize: moderateScale(13),
  },
  productNameText: {
    fontFamily: "Inter-Bold",
    fontWeight: "700",
    color: "#111827",
    marginBottom: exactScale(12),
    fontSize: moderateScale(20),
    lineHeight: moderateScale(28),
  },
  dashedDivider: {
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    marginBottom: exactScale(12),
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: exactScale(6),
    marginBottom: exactScale(4),
  },
  sellingPriceText: {
    fontFamily: "Inter-ExtraBold",
    fontWeight: "800",
    color: "#111827",
    fontSize: moderateScale(24),
  },
  mrpLabel: {
    fontFamily: "Inter-Medium",
    fontWeight: "500",
    color: "#6B7280",
    marginLeft: exactScale(4),
    fontSize: moderateScale(13),
  },
  mrpValue: {
    fontFamily: "Inter-Medium",
    fontWeight: "500",
    color: "#6B7280",
    textDecorationLine: "line-through",
    fontSize: moderateScale(13),
  },
  savingsText: {
    fontFamily: "Inter-Bold",
    fontWeight: "700",
    color: "#0F7635",
    marginLeft: exactScale(8),
    fontSize: moderateScale(14),
  },
  packLabelText: {
    fontFamily: "Inter-Medium",
    fontWeight: "500",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontSize: moderateScale(12),
  },
  inclusiveTaxesText: {
    textTransform: "none",
    letterSpacing: 0,
    color: "#6B7280",
  },
  variantsSection: {
    marginTop: exactScale(16),
  },
  selectPackTitle: {
    fontFamily: "Inter-SemiBold",
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: exactScale(12),
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontSize: moderateScale(12),
  },
  variantsScrollContent: {
    gap: exactScale(10),
    paddingRight: exactScale(4),
  },
  variantCard: {
    width: exactScale(120),
    borderRadius: exactScale(12),
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  variantCardSelected: {
    borderWidth: 1.5,
    borderColor: "#0F763580",
  },
  variantTopBox: {
    paddingHorizontal: exactScale(10),
    paddingVertical: exactScale(10),
    backgroundColor: "#FAFAFA",
  },
  variantTopBoxSelected: {
    backgroundColor: "#FAFFF3",
  },
  variantPackSizeText: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#9CA3AF",
  },
  variantPackSizeTextSelected: {
    color: "#0F7635",
  },
  variantDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  variantDividerSelected: {
    backgroundColor: "#0F763530",
  },
  variantBottomBox: {
    paddingHorizontal: exactScale(10),
    paddingVertical: exactScale(10),
    backgroundColor: "#FFFFFF",
  },
  variantPriceText: {
    fontSize: moderateScale(15),
    fontWeight: "700",
    color: "#111827",
    marginBottom: exactScale(2),
  },
  variantUnitPriceText: {
    fontSize: moderateScale(12),
    fontWeight: "400",
    color: "#6B7280",
  },
});
