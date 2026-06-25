import { moderateScale } from "react-native-size-matters";
import { StyleSheet } from "react-native";
import { exactScale } from "@/src/utils/exactScale";

export const CART_BTN_HEIGHT = exactScale(40);
export const COUNTER_HIT = exactScale(40);

export const styles = StyleSheet.create({
  badgeText: { fontSize: moderateScale(12, 0.3) },
  name: {
    fontSize: moderateScale(14, 0.3),
    lineHeight: moderateScale(18, 0.3),
  },
  description: { fontSize: moderateScale(12, 0.3) },
  price: { fontSize: moderateScale(16, 0.3) },
  mrpLabel: { fontSize: moderateScale(12, 0.3) },
  mrpValue: { fontSize: moderateScale(12, 0.3) },
  addToCart: { fontSize: moderateScale(14, 0.3) },
  counter: { fontSize: moderateScale(20, 0.3) },
  counterVal: {
    fontSize: moderateScale(14, 0.3),
    width: exactScale(24),
    textAlign: "center",
  },
});
