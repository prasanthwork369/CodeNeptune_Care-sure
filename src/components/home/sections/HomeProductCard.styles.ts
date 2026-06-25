import { StyleSheet } from "react-native";
import { exactScale } from "@/src/utils/exactScale";

export const CART_BTN_HEIGHT = exactScale(40);
export const COUNTER_HIT = exactScale(40);

export const styles = StyleSheet.create({
  badgeText: { fontSize: exactScale(12) },
  name: {
    fontSize: exactScale(14),
    lineHeight: exactScale(18),
  },
  description: { fontSize: exactScale(12) },
  price: { fontSize: exactScale(16) },
  mrpLabel: { fontSize: exactScale(12) },
  mrpValue: { fontSize: exactScale(12) },
  addToCart: { fontSize: exactScale(14) },
  counter: { fontSize: exactScale(20) },
  counterVal: {
    fontSize: exactScale(14),
    width: exactScale(24),
    textAlign: "center",
  },
});
