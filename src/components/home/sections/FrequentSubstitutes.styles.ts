import { StyleSheet } from 'react-native';
import { moderateScale, scale } from 'react-native-size-matters';

export const IMG_SIZE = scale(100);

export const styles = StyleSheet.create({
    badge:       { fontSize: moderateScale(10, 0.08) },
    name:        { fontSize: moderateScale(14, 0.08) },
    brand:       { fontSize: moderateScale(11, 0.08) },
    description: { fontSize: moderateScale(11, 0.08) },
    price:       { fontSize: moderateScale(16, 0.08) },
    mrp:         { fontSize: moderateScale(12, 0.08) },
    addBtn:      { fontSize: moderateScale(13, 0.08) },
    counter:     { fontSize: moderateScale(18, 0.08) },
    counterVal:  { fontSize: moderateScale(13, 0.08) },
    imgBox:      { width: IMG_SIZE, height: IMG_SIZE },
    imgInner:    { width: moderateScale(54, 0.25), height: moderateScale(54, 0.25) },
});
