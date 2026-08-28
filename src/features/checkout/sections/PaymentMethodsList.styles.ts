import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  heading: {
    fontSize: moderateScale(16),
    fontWeight: "700",
    color: "#1A1C1E",
    marginBottom: exactScale(12),
    marginLeft: exactScale(4),
  },
  listWrap: {
    gap: exactScale(12),
  },
  methodCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: exactScale(16),
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#919EAB33",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 4,
  },
  methodCardSelected: {
    borderWidth: 2,
    borderColor: "#0F7635",
  },
  methodCardUnselected: {
    borderWidth: 0,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    justifyContent: "center",
  },
  infoCol: {
    flex: 1,
    marginLeft: exactScale(16),
  },
  title: {
    fontSize: moderateScale(15),
    fontWeight: "700",
    color: "#1A1C1E",
  },
  subtitle: {
    fontSize: moderateScale(12),
    fontWeight: "500",
    color: "#6B7280",
    marginTop: exactScale(4),
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  radioOuterSelected: {
    borderColor: "#0F7635",
  },
  radioOuterUnselected: {
    borderColor: "#E5E7EB",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
