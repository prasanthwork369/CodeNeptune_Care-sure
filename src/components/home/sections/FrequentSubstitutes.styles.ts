import { StyleSheet } from 'react-native';
import { moderateScale, scale } from 'react-native-size-matters';

export const IMG_SIZE = scale(100);

export const styles = StyleSheet.create({
    badge:       { fontSize: moderateScale(10, 0.25) },
    name:        { fontSize: moderateScale(14, 0.25) },
    brand:       { fontSize: moderateScale(11, 0.25) },
    description: { fontSize: moderateScale(11, 0.25) },
    price:       { fontSize: moderateScale(16, 0.25) },
    mrp:         { fontSize: moderateScale(12, 0.25) },
    addBtn:      { fontSize: moderateScale(13, 0.25) },
    counter:     { fontSize: moderateScale(18, 0.25) },
    counterVal:  { fontSize: moderateScale(13, 0.25) },
    imgBox:      { width: IMG_SIZE, height: IMG_SIZE },
    imgInner:    { width: moderateScale(54, 0.25), height: moderateScale(54, 0.25) },
});
