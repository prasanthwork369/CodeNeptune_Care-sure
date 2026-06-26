import { StyleSheet } from 'react-native';
import { exactScale, moderateScale } from '@/src/utils/exactScale';

export const styles = StyleSheet.create({
    sectionTitle:  { fontSize: moderateScale(14, 0.1) },
    numberCircle:  { width: exactScale(20), height: exactScale(20) },
    numberText:    { fontSize: moderateScale(10, 0.07) },
    itemLabel:     { fontSize: moderateScale(13, 0.1) },
    footerNote:    { fontSize: moderateScale(12, 0.1) },
});
