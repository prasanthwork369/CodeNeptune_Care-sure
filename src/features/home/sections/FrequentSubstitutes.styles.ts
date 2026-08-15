import { StyleSheet } from "react-native";
import { exactScale, moderateScale } from "@/src/utils/exactScale";

export const IMG_SIZE = exactScale(100);

export const styles = StyleSheet.create({
  badge: { fontSize: moderateScale(10) },
  name: { fontSize: moderateScale(14) },
  brand: { fontSize: moderateScale(11) },
  description: { fontSize: moderateScale(11) },
  price: { fontSize: moderateScale(16) },
  mrp: { fontSize: moderateScale(12) },
  addBtn: { fontSize: moderateScale(13) },
  counter: { fontSize: moderateScale(18) },
  counterVal: { fontSize: moderateScale(13) },
  imgBox: { width: IMG_SIZE, height: IMG_SIZE },
  imgInner: { width: exactScale(54), height: exactScale(54) },
});
