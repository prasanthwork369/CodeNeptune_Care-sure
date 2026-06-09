import { StyleSheet } from 'react-native';
import { moderateScale } from 'react-native-size-matters';

export const styles = StyleSheet.create({
    badge:       { fontSize: moderateScale(11, 0.25) },
    name:        { fontSize: moderateScale(13, 0.25), lineHeight: moderateScale(18, 0.25) },
    description: { fontSize: moderateScale(11, 0.25) },
    price:       { fontSize: moderateScale(15, 0.25) },
    mrp:         { fontSize: moderateScale(11, 0.25) },
    addBtn:      { fontSize: moderateScale(13, 0.25) },
    counter:     { fontSize: moderateScale(20, 0.25) },
    counterVal:  { fontSize: moderateScale(14, 0.25) },
    sectionTitle:    { fontSize: moderateScale(14, 0.25) },
    sectionSubtitle: { fontSize: moderateScale(18, 0.25), lineHeight: moderateScale(26, 0.25) },
});
