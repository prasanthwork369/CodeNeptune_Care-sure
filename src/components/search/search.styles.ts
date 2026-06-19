import { StyleSheet } from "react-native";
import { moderateScale, scale } from "react-native-size-matters";

// Shared cart counter used across all search cards
export const COUNTER_WIDTH = scale(90);
export const COUNTER_BTN_W = scale(36);
export const cartCounterStyles = StyleSheet.create({
  wrap: { width: COUNTER_WIDTH },
  wrapActive: { width: COUNTER_WIDTH, backgroundColor: "#0F7635" },
  btn: {
    width: COUNTER_BTN_W,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtn: {
    width: scale(78),
    height: scale(35),
    alignSelf: "flex-start",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#0F7635",
    paddingVertical: 8,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  addText: { fontSize: moderateScale(14, 0.3) },
  plusMinus: { fontSize: moderateScale(20, 0.3) },
  countText: { fontSize: moderateScale(14, 0.3) },
  countContainer: {
    flex: 1,
    paddingVertical: 9,
    alignItems: "center",
    justifyContent: "center",
  },
});

export const searchCardStyles = StyleSheet.create({
  name: { fontSize: moderateScale(14, 0.3), lineHeight: 22 },
  desc: { fontSize: moderateScale(12, 0.3) },
  price: { fontSize: moderateScale(18, 0.3), lineHeight: 18 },
  priceSm: { fontSize: moderateScale(16, 0.3) },
  mrp: { fontSize: moderateScale(14, 0.3), lineHeight: 14 },
  savings: { fontSize: moderateScale(12, 0.3), lineHeight: 12 },
  savingsTag: { fontSize: moderateScale(11, 0.3) },
  badge: { fontSize: moderateScale(12, 0.3) },
  label: { fontSize: moderateScale(14, 0.3) },
  sameComp: { fontSize: moderateScale(14, 0.3) },
  checkIcon: { width: scale(18), height: scale(18) },
  sellIcon: { width: scale(15), height: scale(15), top: 1.5, left: 1.5 },
  imgBox: { width: scale(80), height: scale(80) },
  imgInner: { width: scale(64), height: scale(64) },
  recImgBox: {
    width: scale(78),
    height: scale(78),
    borderRadius: scale(12),
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  recCard: {
    borderWidth: 1,
    borderColor: "#919EAB33",
    backgroundColor: "#F4FFF7",
    minHeight: scale(148),
  },
});

export const searchRecentStyles = StyleSheet.create({
  sectionTitle: { fontSize: moderateScale(15, 0.3) },
  clearBtn: { fontSize: moderateScale(13, 0.3) },
  chipText: { fontSize: moderateScale(13, 0.3) },
  chipIcon: { width: scale(14), height: scale(14) },
  trendIcon: { width: scale(16), height: scale(16) },
});

export const searchCartBarStyles = StyleSheet.create({
  price: { fontSize: moderateScale(20, 0.3) },
  items: { fontSize: moderateScale(13, 0.3) },
  btnText: { fontSize: moderateScale(16, 0.3) },
});

export const trustBadgeStyles = StyleSheet.create({
  sectionTitle: { fontSize: moderateScale(14, 0.3) },
  label: { fontSize: moderateScale(12, 0.3) },
  value: { fontSize: moderateScale(14, 0.3) },
  checkIcon: { width: scale(14), height: scale(14) },
  modiLogo: { width: scale(90), height: scale(24) },
  ciplaLogo: { width: scale(60), height: scale(20) },
});

export const logisticsBarStyles = StyleSheet.create({
  text: { fontSize: moderateScale(12, 0.3) },
  change: { fontSize: moderateScale(14, 0.3) },
  bagIcon: { width: scale(20), height: scale(20) },
  locIcon: { width: scale(18), height: scale(18) },
});

// Search box used in ProductHeader (search screen header)
export const searchHeaderStyles = StyleSheet.create({
  box: {
    height: scale(55),
    borderRadius: scale(12),
    borderWidth: 1.05,
    borderColor: "#919EAB33",
    paddingLeft: scale(16),
    paddingRight: scale(16),
    shadowColor: "#919EAB0A",
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    shadowOpacity: 0.1,
    elevation: 4,
  },
  inputText: {
    fontSize: moderateScale(13, 0.3),
    fontFamily: "Inter-regular",
    color: "#222222",
    padding: 0,
    margin: 0,
    height: scale(28),
    lineHeight: moderateScale(16, 0.3),
    letterSpacing: 0,
    includeFontPadding: false,
  },
});
