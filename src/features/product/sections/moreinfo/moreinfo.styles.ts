import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // ─── SectionCard (ProductSectionView) ───────────────────────────────────────
  sectionCard: {
    borderRadius: exactScale(12),
    borderWidth: 1,
    borderColor: "#F1F2F4",
    backgroundColor: "#FFFFFF",
    padding: exactScale(16),
    marginBottom: exactScale(12),
  },
  sectionCardTitle: {
    fontFamily: "Inter-Bold",
    fontWeight: "700",
    color: "#111827",
    fontSize: moderateScale(15),
    marginBottom: exactScale(12),
  },

  // ─── AdviceCardsSection ─────────────────────────────────────────────────────
  adviceScroll: {
    marginTop: exactScale(16),
    paddingBottom: exactScale(8),
  },
  adviceScrollContent: {
    paddingRight: exactScale(16),
  },
  adviceCardsRow: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  adviceCard: {
    marginRight: exactScale(12),
    borderRadius: exactScale(12),
    borderWidth: 1,
    borderColor: "#919EAB33",
    backgroundColor: "#FFFFFF",
    padding: exactScale(12),
  },
  adviceIcon: {
    marginBottom: exactScale(16),
  },
  adviceTitle: {
    marginBottom: exactScale(8),
    fontFamily: "Inter-SemiBold",
    fontWeight: "600",
    color: "#111827",
    fontSize: moderateScale(14),
  },
  adviceBadge: {
    marginBottom: exactScale(8),
    alignSelf: "flex-start",
    borderRadius: exactScale(4),
    paddingHorizontal: exactScale(8),
    paddingVertical: exactScale(4),
  },
  adviceBadgeText: {
    fontFamily: "Inter-SemiBold",
    fontWeight: "600",
    fontSize: moderateScale(10),
  },
  adviceDescription: {
    fontFamily: "Inter-Medium",
    fontWeight: "500",
    color: "#6B7280",
    fontSize: moderateScale(12),
    lineHeight: moderateScale(17),
  },
  adviceExpandBtn: {
    marginTop: exactScale(8),
    alignSelf: "flex-start",
  },
  adviceExpandText: {
    fontFamily: "Inter-SemiBold",
    fontWeight: "600",
    color: "#0F7635",
    fontSize: moderateScale(12),
  },

  // ─── FaqSection ─────────────────────────────────────────────────────────────
  faqContainer: {
    marginTop: -exactScale(8),
  },
  faqRow: {
    borderWidth: 1,
    borderColor: "#F1F2F4",
    borderRadius: exactScale(12),
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    marginTop: exactScale(8),
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: exactScale(14),
  },
  faqQuestion: {
    flex: 1,
    fontFamily: "Inter-Bold",
    fontWeight: "700",
    color: "#111827",
    fontSize: moderateScale(14),
    lineHeight: moderateScale(19),
    marginRight: exactScale(10),
  },
  faqAnswerContainer: {
    borderTopWidth: 1,
    borderTopColor: "#F6F7F8",
    padding: exactScale(14),
  },
  faqAnswerText: {
    fontFamily: "Inter-Medium",
    fontWeight: "500",
    color: "#5E6670",
    fontSize: moderateScale(13),
    lineHeight: moderateScale(20),
  },
  faqShowAllBtn: {
    marginTop: exactScale(12),
    alignSelf: "flex-start",
    paddingHorizontal: exactScale(8),
    paddingVertical: exactScale(4),
  },
  faqShowAllText: {
    fontFamily: "Inter-Bold",
    fontWeight: "700",
    color: "#0F7635",
    fontSize: moderateScale(13),
  },

  // ─── BulletListSection ───────────────────────────────────────────────────────
  bulletContainer: {
    backgroundColor: "#FFFAF0",
    borderWidth: 1,
    borderColor: "#FFEDD5",
    borderRadius: exactScale(12),
    padding: exactScale(16),
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  bulletDot: {
    borderRadius: exactScale(999),
    backgroundColor: "#FB923C",
    width: exactScale(6),
    height: exactScale(6),
    marginTop: exactScale(6),
    marginRight: exactScale(10),
  },
  bulletText: {
    flex: 1,
    fontFamily: "Inter-Medium",
    fontWeight: "500",
    color: "#6B7280",
    fontSize: moderateScale(13),
    lineHeight: moderateScale(19),
  },

  // ─── KeyValueSection ────────────────────────────────────────────────────────
  keyValueRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FDFBF6",
    borderRadius: exactScale(8),
    padding: exactScale(14),
  },
  keyValueLabel: {
    fontFamily: "Inter-Medium",
    fontWeight: "500",
    color: "#6B7280",
    fontSize: moderateScale(13),
    flex: 1,
  },
  keyValueVal: {
    fontFamily: "Inter-Bold",
    fontWeight: "700",
    color: "#111827",
    textAlign: "right",
    fontSize: moderateScale(13),
    flex: 1,
  },
});
