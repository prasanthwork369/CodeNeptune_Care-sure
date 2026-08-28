import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  wrapper: {
    marginBottom: exactScale(24),
  },
  heading: {
    fontSize: moderateScale(16),
    fontWeight: "700",
    color: "#1A1C1E",
    marginBottom: exactScale(12),
    marginLeft: exactScale(4),
  },
  card: {
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
  cardSelected: {
    borderWidth: 0,
  },
  cardMissing: {
    borderWidth: 1.5,
    borderColor: "#FCA5A5",
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBoxGreen: {
    backgroundColor: "#F0FDF4",
  },
  iconBoxRed: {
    backgroundColor: "#FEF2F2",
  },
  infoCol: {
    flex: 1,
    marginLeft: exactScale(16),
  },
  label: {
    fontSize: moderateScale(14),
    fontWeight: "700",
    color: "#1A1C1E",
  },
  subLabel: {
    fontSize: moderateScale(13),
    fontWeight: "500",
    color: "#6B7280",
    marginTop: exactScale(4),
  },
  arrowBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
});
