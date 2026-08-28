import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F5F6FB",
  },
  faqCard: {
    borderRadius: exactScale(12),
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#EEEFF1",
  },
  emptyRoot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: exactScale(32),
  },
  emptyText: {
    fontFamily: "Inter-Medium",
    fontWeight: "500",
    color: "#6B7280",
    textAlign: "center",
    fontSize: moderateScale(14),
  },
  // Row touchable
  rowTouchable: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: exactScale(20),
    paddingVertical: exactScale(24),
  },
  rowQuestion: {
    flex: 1,
    fontFamily: "Inter-SemiBold",
    fontWeight: "600",
    color: "#111827",
    paddingRight: exactScale(12),
    fontSize: moderateScale(15),
    lineHeight: moderateScale(22),
  },
  answerWrap: {
    paddingHorizontal: exactScale(20),
    paddingBottom: exactScale(20),
  },
  answerText: {
    fontFamily: "Inter-Medium",
    fontWeight: "500",
    color: "#6B7280",
    fontSize: moderateScale(13),
    lineHeight: moderateScale(20),
  },
  // Skeleton
  skeletonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: exactScale(20),
    paddingVertical: exactScale(24),
  },
  skeletonCard: {
    borderRadius: exactScale(12),
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#EEEFF1",
    backgroundColor: "#FFFFFF",
  },
});
