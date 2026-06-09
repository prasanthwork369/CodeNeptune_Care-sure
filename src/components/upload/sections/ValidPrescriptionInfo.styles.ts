import { StyleSheet } from 'react-native';
import { moderateScale, scale } from 'react-native-size-matters';

export const styles = StyleSheet.create({
    sectionTitle:  { fontSize: moderateScale(14, 0.3) },
    numberCircle:  { width: scale(20), height: scale(20) },
    numberText:    { fontSize: moderateScale(10, 0.2) },
    itemLabel:     { fontSize: moderateScale(13, 0.3) },
    footerNote:    { fontSize: moderateScale(12, 0.3) },
});
