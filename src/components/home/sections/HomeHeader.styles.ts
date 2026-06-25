import { moderateScale } from "react-native-size-matters";
import { colors } from "@/src/constants/theme";
import { StyleSheet } from "react-native";
import { exactScale } from "@/src/utils/exactScale";

export const styles = StyleSheet.create({
  deliverLabel: {
    fontSize: moderateScale(12, 0.3),
    lineHeight: moderateScale(14, 0.3),
    letterSpacing: 0.4,
    color: "#333232",
  },
  locationText: {
    fontSize: moderateScale(16, 0.3),
    lineHeight: moderateScale(18, 0.3),
    letterSpacing: 0,
    color: colors.text,
  },
  dropDownIcon: {
    marginLeft: exactScale(10),
    width: exactScale(10),
    height: exactScale(5),
  },
  iconBtn: {
    width: exactScale(44),
    height: exactScale(44),
    borderRadius: 9999,
    opacity: 1,
    shadowColor: "#919EAB",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationBtn: {
    width: exactScale(44),
    height: exactScale(44),
    borderRadius: 9999,
    opacity: 1,
    shadowColor: "#919EAB",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationIcon: {
    width: exactScale(24),
    height: exactScale(26),
  },
  walletIcon: {
    width: exactScale(32),
    height: exactScale(32),
    opacity: 1,
  },
  walletBadgeWrap: {
    width: exactScale(54),
    height: exactScale(15),
    paddingTop: 2,
    paddingRight: 9,
    paddingBottom: 2,
    paddingLeft: 9,
    borderRadius: 18,
    borderWidth: 0.5,
    borderColor: "#919EAB33",
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    opacity: 1,
  },
  walletBadgeText: {
    fontSize: moderateScale(10, 0.3),
    lineHeight: moderateScale(10, 0.3),
    letterSpacing: 0,
    color: colors.text,
    padding: 1,
  },
  badge: { minWidth: exactScale(18), height: exactScale(18) },
  badgeText: { fontSize: moderateScale(10, 0.3) },
});
