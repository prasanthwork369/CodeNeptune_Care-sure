import { StyleSheet } from "react-native";
import { exactScale, moderateScale } from "@/src/utils/exactScale";

export const CART_BTN_HEIGHT = exactScale(40);
export const COUNTER_HIT = exactScale(40);

export const styles = StyleSheet.create({
  badgeText: { fontSize: moderateScale(12) },
  name: {
    fontSize: moderateScale(14),
    lineHeight: moderateScale(18),
  },
  description: { fontSize: moderateScale(12) },
  price: { fontSize: moderateScale(16) },
  mrpLabel: { fontSize: moderateScale(12) },
  mrpValue: { fontSize: moderateScale(12) },
  addToCart: { fontSize: moderateScale(14) },
  counter: { fontSize: moderateScale(20) },
  counterVal: {
    fontSize: moderateScale(14),
    width: exactScale(24),
    textAlign: "center",
  },
});
