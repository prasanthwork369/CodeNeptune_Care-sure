import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: exactScale(100),
  },
  carouselMock: {
    marginBottom: exactScale(32),
    paddingTop: exactScale(16),
    alignItems: "center",
  },
  previewImageBox: {
    borderRadius: exactScale(16),
    overflow: "hidden",
    backgroundColor: "#F9FAFB",
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
  detailsSection: {
    paddingHorizontal: exactScale(20),
  },
  brandText: {
    fontSize: moderateScale(12),
    color: "#6B7280",
    marginBottom: exactScale(6),
    fontWeight: "500",
  },
  brandSkeleton: {
    marginBottom: exactScale(8),
  },
  nameText: {
    fontSize: moderateScale(18),
    fontWeight: "700",
    color: "#111827",
    marginBottom: exactScale(12),
    lineHeight: moderateScale(24),
  },
  nameSkeleton1: {
    marginBottom: exactScale(8),
  },
  nameSkeleton2: {
    marginBottom: exactScale(16),
  },
  pricingRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: exactScale(8),
    marginBottom: exactScale(16),
  },
  subtitleSkeleton: {
    marginBottom: exactScale(20),
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginTop: exactScale(16),
    marginBottom: exactScale(16),
  },
  variantBannerMock: {
    backgroundColor: "#F9FAFB",
    paddingVertical: exactScale(16),
    paddingHorizontal: exactScale(20),
    marginBottom: exactScale(24),
  },
  logisticsCardMock: {
    marginHorizontal: exactScale(20),
    marginBottom: exactScale(24),
    padding: exactScale(16),
    borderRadius: exactScale(12),
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  logisticsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logisticsTextCol: {
    marginLeft: exactScale(12),
    flex: 1,
  },
  logisticsLine1: {
    marginBottom: exactScale(6),
  },
  trustBadgeRow: {
    flexDirection: "row",
    paddingHorizontal: exactScale(20),
    marginBottom: exactScale(32),
    justifyContent: "space-between",
  },
  trustBadgeItem: {
    alignItems: "center",
  },
  trustBadgeIcon: {
    marginBottom: exactScale(8),
  },
  footerMock: {
    paddingHorizontal: exactScale(20),
    paddingTop: exactScale(16),
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
});
