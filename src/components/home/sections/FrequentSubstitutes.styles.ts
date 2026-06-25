import { moderateScale } from "react-native-size-matters";
import { StyleSheet } from 'react-native';
import { exactScale } from "@/src/utils/exactScale";

export const IMG_SIZE = exactScale(100);

export const styles = StyleSheet.create({
    badge:       { fontSize: moderateScale(10, 0.3) },
    name:        { fontSize: moderateScale(14, 0.3) },
    brand:       { fontSize: moderateScale(11, 0.3) },
    description: { fontSize: moderateScale(11, 0.3) },
    price:       { fontSize: moderateScale(16, 0.3) },
    mrp:         { fontSize: moderateScale(12, 0.3) },
    addBtn:      { fontSize: moderateScale(13, 0.3) },
    counter:     { fontSize: moderateScale(18, 0.3) },
    counterVal:  { fontSize: moderateScale(13, 0.3) },
    imgBox:      { width: IMG_SIZE, height: IMG_SIZE },
    imgInner:    { width: exactScale(54), height: exactScale(54) },
});
