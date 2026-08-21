import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // NotificationCard
  cardIconBox: { width: exactScale(48), height: exactScale(48) },
  cardIcon: { width: exactScale(24), height: exactScale(24) },
  cardAmtImg: { width: exactScale(20), height: exactScale(20) },
  cardTitle: { fontSize: moderateScale(16) },
  cardDate: { fontSize: moderateScale(12) },
  cardAmount: { fontSize: moderateScale(16) },

  // NotificationsLayout
  clearBtn: { fontSize: moderateScale(13) },
  clearAllButton: {
    minHeight: exactScale(40),
    marginLeft: exactScale(8),
    justifyContent: "center",
  },
  clearAllText: {
    fontSize: moderateScale(13),
    lineHeight: moderateScale(16),
    fontWeight: "600",
  },
  content: {
    paddingHorizontal: exactScale(15),
    // Android's RecyclerView-backed FlashList can promote to a hardware layer
    // during fast scroll/overscroll; without its own opaque background here,
    // that layer's default (black) briefly shows through instead of the
    // screen's white. WalletHistoryPage's contentContainerStyle already sets
    // this for the same reason — Notifications never got it.
    backgroundColor: "#FFFFFF",
  },
  section: {
    marginTop: exactScale(16),
  },
  firstSection: {
    marginTop: exactScale(12),
  },
  rxIconBox: { width: exactScale(40), height: exactScale(40) },
  rxIcon: { width: exactScale(24), height: exactScale(24) },
  rxTitle: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#1A1C1E",
    marginBottom: exactScale(2),
  },
  rxSub: { fontSize: moderateScale(12), fontWeight: "400", color: "#6A6A6A" },
  rxChip: { fontSize: moderateScale(11), fontWeight: "600" },
  emptyIcon: { width: exactScale(48), height: exactScale(48) },
  emptyTitle: { fontSize: moderateScale(15) },
  emptySub: { fontSize: moderateScale(13) },
  notifIconBox: { width: exactScale(40), height: exactScale(40) },
  notifIcon: { width: exactScale(20), height: exactScale(20) },
  notifTitle: {
    fontSize: moderateScale(14),
    lineHeight: moderateScale(20),
    fontWeight: "600",
    color: "#222222",
    letterSpacing: 0,
  },
  notifBody: {
    fontSize: moderateScale(12),
    lineHeight: moderateScale(18),
    fontWeight: "400",
    color: "#6A6A6A",
    letterSpacing: 0,
  },
  notifTime: {
    fontSize: moderateScale(10),
    lineHeight: moderateScale(12),
    fontWeight: "500",
    color: "#ADABAB",
    letterSpacing: 0,
  },
  notifRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  notifLeading: {
    width: exactScale(56),
    minHeight: exactScale(40),
    justifyContent: "flex-start",
  },
  notifIconPosition: {
    marginLeft: exactScale(16),
  },
  notifCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: exactScale(5),
  },
  optionsTarget: {
    width: exactScale(24),
    height: exactScale(24),
    marginLeft: exactScale(34),
    alignItems: "center",
    justifyContent: "center",
  },

  // Section header (TODAY / YESTERDAY / THIS WEEK)
  sectionHeader: {
    fontSize: moderateScale(14),
    lineHeight: moderateScale(17),
    fontWeight: "600",
    color: "#6A6A6A",
    letterSpacing: 0,
    textTransform: "uppercase",
    marginBottom: exactScale(16),
  },

  // Unread dot
  unreadDot: {
    position: "absolute",
    left: 0,
    top: exactScale(17),
    width: exactScale(6),
    height: exactScale(6),
    borderRadius: exactScale(3),
    backgroundColor: "#0F7635",
  },

  // Options popover (Clear / Mark as read)
  popoverWidth: { width: exactScale(190) },
  popoverIcon: { width: exactScale(13), height: exactScale(13) },
  popoverIconAlt: { width: exactScale(18), height: exactScale(18) },
  popoverText: { fontSize: moderateScale(15) },

  // 3-dot trigger
  dotsIcon: { width: exactScale(4.2), height: exactScale(16) },
  errorTitle: {
    fontSize: moderateScale(15),
    lineHeight: moderateScale(20),
    fontWeight: "600",
    color: "#222222",
  },
  errorSub: {
    marginTop: exactScale(4),
    fontSize: moderateScale(13),
    lineHeight: moderateScale(18),
    fontWeight: "400",
    color: "#6A6A6A",
    textAlign: "center",
  },
  retryButton: {
    marginTop: exactScale(16),
    minHeight: exactScale(40),
    paddingHorizontal: exactScale(20),
    borderRadius: exactScale(8),
    backgroundColor: "#0F7635",
    alignItems: "center",
    justifyContent: "center",
  },
  retryText: {
    fontSize: moderateScale(13),
    lineHeight: moderateScale(16),
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
