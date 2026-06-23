import { StyleSheet } from "react-native";
import { moderateScale, scale } from "react-native-size-matters";

export const CART_BTN_HEIGHT = moderateScale(40, 0.25);
export const COUNTER_HIT = moderateScale(40, 0.25);

export const styles = StyleSheet.create({
  badgeText: { fontSize: moderateScale(12, 0.08) },
  name: {
    fontSize: moderateScale(14, 0.08),
    lineHeight: moderateScale(18, 0.08),
  },
  description: { fontSize: moderateScale(12, 0.08) },
  price: { fontSize: moderateScale(16, 0.08) },
  mrpLabel: { fontSize: moderateScale(12, 0.08) },
  mrpValue: { fontSize: moderateScale(12, 0.08) },
  addToCart: { fontSize: moderateScale(14, 0.08) },
  counter: { fontSize: moderateScale(20, 0.08) },
  counterVal: {
    fontSize: moderateScale(14, 0.08),
    width: scale(24),
    textAlign: "center",
  },
});
