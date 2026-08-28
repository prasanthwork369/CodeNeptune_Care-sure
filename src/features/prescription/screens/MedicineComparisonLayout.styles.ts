import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollContent: {
    paddingBottom: exactScale(24),
    borderWidth: 0,
  },
  cardsSection: {
    padding: exactScale(16),
    paddingBottom: 0,
  },
  cardItemWrap: {
    marginBottom: exactScale(16),
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9FAFB",
    padding: exactScale(24),
  },
  emptyText: {
    fontSize: moderateScale(15),
    fontWeight: "500",
    color: "#6B7280",
    textAlign: "center",
    marginBottom: exactScale(20),
  },
  refreshBtn: {
    backgroundColor: "#0F7635",
    borderRadius: exactScale(12),
    paddingVertical: exactScale(14),
    paddingHorizontal: exactScale(32),
  },
  refreshBtnText: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
