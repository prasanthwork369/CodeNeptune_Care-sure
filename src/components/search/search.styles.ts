import { StyleSheet } from "react-native";
import { exactScale, moderateScale } from "@/src/utils/exactScale";

// Shared cart counter used across all search cards
export const COUNTER_WIDTH = exactScale(90);
export const COUNTER_BTN_W = exactScale(36);
export const cartCounterStyles = StyleSheet.create({
  wrap: { width: COUNTER_WIDTH },
  // Match addBtn's fixed height so swapping Add ↔ stepper (count 0 ↔ 1) never
  // changes the row/card height.
  wrapActive: { width: COUNTER_WIDTH, height: exactScale(35), backgroundColor: "#0F7635" },
  btn: {
    width: COUNTER_BTN_W,
    paddingVertical: exactScale(6),
    alignItems: "center",
    justifyContent: "center",
  },
  addBtn: {
    minWidth: exactScale(78),
    height: exactScale(35),
    alignSelf: "flex-start",
    borderRadius: exactScale(6),
    borderWidth: 1,
    borderColor: "#0F7635",
    paddingVertical: exactScale(8),
    paddingHorizontal: exactScale(24),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  addText: { fontSize: moderateScale(14) },
  plusMinus: { fontSize: moderateScale(20) },
  countText: { fontSize: moderateScale(14) },
  countContainer: {
    flex: 1,
    paddingVertical: exactScale(9),
    alignItems: "center",
    justifyContent: "center",
  },
});

export const searchCardStyles = StyleSheet.create({
  name: { fontSize: moderateScale(14), lineHeight: moderateScale(22) },
  desc: { fontSize: moderateScale(12) },
  price: { fontSize: moderateScale(18), lineHeight: moderateScale(18) },
  priceSm: { fontSize: moderateScale(16) },
  mrp: { fontSize: moderateScale(14), lineHeight: moderateScale(14) },
  savings: { fontSize: moderateScale(12), lineHeight: moderateScale(12) },
  savingsTag: { fontSize: moderateScale(11) },
  badge: { fontSize: moderateScale(12) },
  label: { fontSize: moderateScale(14) },
  sameComp: { fontSize: moderateScale(14) },
  checkIcon: { width: exactScale(18), height: exactScale(18) },
  sellIcon: { width: exactScale(15), height: exactScale(15), top: exactScale(1.5), left: exactScale(1.5) },
  imgBox: { width: exactScale(80), height: exactScale(80) },
  imgInner: { width: exactScale(64), height: exactScale(64) },
  recImgBox: {
    width: exactScale(78),
    height: exactScale(78),
    borderRadius: exactScale(12),
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  recCard: {
    borderWidth: 1,
    borderColor: "#919EAB33",
    backgroundColor: "#FBFFF2",
    minHeight: exactScale(148),
  },
});

export const searchRecentStyles = StyleSheet.create({
  sectionTitle: { fontSize: moderateScale(15) },
  clearBtn: { fontSize: moderateScale(13) },
  chipText: { fontSize: moderateScale(13) },
  chipIcon: { width: exactScale(14), height: exactScale(14) },
  trendIcon: { width: exactScale(16), height: exactScale(16) },
});

export const searchCartBarStyles = StyleSheet.create({
  price: { fontSize: moderateScale(20) },
  items: { fontSize: moderateScale(13) },
  btnText: { fontSize: moderateScale(16) },
});

export const trustBadgeStyles = StyleSheet.create({
  sectionTitle: { fontSize: moderateScale(14) },
  label: { fontSize: moderateScale(12) },
  value: { fontSize: moderateScale(14) },
  checkIcon: { width: exactScale(14), height: exactScale(14) },
  modiLogo: { width: exactScale(90), height: exactScale(24) },
  ciplaLogo: { width: exactScale(60), height: exactScale(20) },
});

export const logisticsBarStyles = StyleSheet.create({
  text: { fontSize: moderateScale(12) },
  change: { fontSize: moderateScale(14) },
  bagIcon: { width: exactScale(20), height: exactScale(20) },
  locIcon: { width: exactScale(18), height: exactScale(18) },
});

// Search box used in ProductHeader (search screen header)
export const searchHeaderStyles = StyleSheet.create({
  box: {
    height: exactScale(60),
    borderRadius: exactScale(12),
    borderWidth: 1.05,
    borderColor: "#919EAB33",
    paddingLeft: exactScale(16),
    paddingRight: exactScale(16),
    shadowColor: "#919EAB0A",
    shadowOffset: { width: 0, height: exactScale(6) },
    shadowRadius: exactScale(10),
    shadowOpacity: 0.1,
    elevation: 4,
  },
  inputText: {
    fontSize: moderateScale(14),
    fontWeight: "400",
    color: "#222222",
    padding: 0,
    margin: 0,
    height: exactScale(28),
    lineHeight: moderateScale(16),
    letterSpacing: 0,
    includeFontPadding: false,
  },
});
