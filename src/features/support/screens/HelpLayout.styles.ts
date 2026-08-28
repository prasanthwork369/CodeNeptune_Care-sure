import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F5F6FB",
  },

  // HelpCard
  helpCard: {
    backgroundColor: "#FFFFFF",
    marginBottom: exactScale(12),
    borderWidth: 1,
    borderColor: "#DFE3E8",
    borderRadius: exactScale(12),
    paddingHorizontal: exactScale(10),
    paddingVertical: exactScale(10),
  },

  // IconCircle
  iconCircle: {
    width: exactScale(48),
    height: exactScale(48),
    borderRadius: exactScale(24),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: exactScale(12),
    backgroundColor: "#F1F9F4",
  },

  // Skeleton wrapper
  skeletonRoot: {
    flex: 1,
    paddingHorizontal: exactScale(16),
    paddingTop: exactScale(16),
  },

  // ScrollView
  scrollView: {
    flex: 1,
  },

  // Texts
  cardTitle: {
    fontFamily: "Inter-Bold",
    fontWeight: "700",
    color: "#111827",
    marginBottom: exactScale(4),
    fontSize: moderateScale(15),
  },
  cardBody: {
    fontFamily: "Inter-Medium",
    fontWeight: "500",
    color: "#6B7280",
    lineHeight: moderateScale(19),
    marginBottom: exactScale(12),
    fontSize: moderateScale(13),
  },
  ctaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  ctaText: {
    fontFamily: "Inter-SemiBold",
    fontWeight: "600",
    color: "#0F7635",
    marginRight: exactScale(8),
    fontSize: moderateScale(15),
  },
  phoneText: {
    fontFamily: "Inter-SemiBold",
    fontWeight: "600",
    color: "#111827",
    marginBottom: exactScale(2),
    fontSize: moderateScale(16),
  },
  waitText: {
    fontFamily: "Inter-Medium",
    fontWeight: "500",
    color: "#3D4A43",
    fontSize: moderateScale(13),
  },
});
