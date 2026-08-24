import { colors } from "@/src/constants/theme";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  deliverLabel: {
    fontSize: moderateScale(12),
    lineHeight: moderateScale(14),
    letterSpacing: 0.4,
    color: "#333232",
  },
  locationText: {
    fontSize: moderateScale(16),
    // 1.25x: city names like Jaipur/Kanpur have descenders and Inter's natural box is ~1.21x.
    lineHeight: moderateScale(20),
    letterSpacing: 0,
    color: colors.text,
    // Caps the city so it ellipsizes at a fixed point, not just on icon collision.
    maxWidth: exactScale(150),
  },
  dropDownIcon: {
    marginLeft: exactScale(10),
    width: exactScale(10),
    height: exactScale(5),
  },
  iconBtn: {
    width: exactScale(44),
    height: exactScale(44),
    borderRadius: exactScale(9999),
    opacity: 1,
    shadowColor: "#919EAB",
    shadowOffset: { width: 0, height: exactScale(2) },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationBtn: {
    width: exactScale(44),
    height: exactScale(44),
    borderRadius: exactScale(9999),
    opacity: 1,
    shadowColor: "#919EAB",
    shadowOffset: { width: 0, height: exactScale(2) },
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
    minWidth: exactScale(54),
    // Fixed, not minHeight: the shimmer (10px) is shorter than the loaded
    // text's own box (13 lineHeight + 2 padding = 15px). A content-driven
    // height let the badge — and the whole header row above it — grow by a
    // few px the moment the balance loaded. This is sized to the text's
    // natural height so the loaded state is unchanged, only the shimmer now
    // matches it instead of the other way around.
    height: exactScale(19),
    paddingTop: exactScale(2),
    paddingRight: exactScale(9),
    paddingBottom: exactScale(2),
    paddingLeft: exactScale(9),
    borderRadius: exactScale(18),
    borderWidth: 0.5,
    borderColor: "#919EAB33",
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    opacity: 1,
  },
  walletBadgeText: {
    fontSize: moderateScale(10),
    lineHeight: moderateScale(13),
    letterSpacing: 0,
    color: colors.text,
    padding: 1,
  },
  badge: { minWidth: exactScale(18), height: exactScale(18) },
  badgeText: { fontSize: moderateScale(10) },
  locationHintArrow: {
    width: exactScale(10),
    height: exactScale(10),
    backgroundColor: "#1A1C1E",
    borderRadius: 0,
    transform: [{ rotate: "45deg" }],
    marginLeft: exactScale(14),
    marginBottom: -exactScale(7),
    zIndex: 1,
  },
  locationHintBubble: {
    backgroundColor: "#1A1C1E",
    borderRadius: exactScale(10),
    paddingVertical: exactScale(6),
    paddingHorizontal: exactScale(12),
    maxWidth: exactScale(230),
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: exactScale(4) },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
    zIndex: 2,
  },
  locationHintText: {
    fontSize: moderateScale(12),
    lineHeight: moderateScale(16),
    color: "#FFFFFF",
  },
});
