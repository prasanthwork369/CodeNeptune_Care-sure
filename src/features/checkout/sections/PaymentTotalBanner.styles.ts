import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  gradientCard: {
    borderRadius: 24,
    padding: exactScale(24),
    marginBottom: exactScale(24),
    shadowColor: "#0F7635",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  label: {
    fontSize: moderateScale(14),
    fontWeight: "500",
    color: "rgba(255,255,255,0.8)",
    letterSpacing: 0.5,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: exactScale(8),
  },
  currency: {
    fontSize: moderateScale(24),
    fontWeight: "700",
    color: "#fff",
    marginRight: exactScale(4),
  },
  amount: {
    fontSize: moderateScale(42),
    fontWeight: "800",
    color: "#fff",
  },
  secureRow: {
    marginTop: exactScale(16),
    paddingTop: exactScale(16),
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.15)",
    flexDirection: "row",
    alignItems: "center",
  },
  secureText: {
    fontSize: moderateScale(12),
    fontWeight: "600",
    color: "#fff",
    marginLeft: exactScale(8),
  },
});
