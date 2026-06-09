import { StyleSheet } from 'react-native';
import { moderateScale, scale } from 'react-native-size-matters';

export const styles = StyleSheet.create({
    sectionTitle: { fontSize: moderateScale(14, 0.3) },
    stepCircle:   { width: scale(32), height: scale(32) },
    stepNumber:   { fontSize: moderateScale(14, 0.3) },
    stepLabel:    { fontSize: moderateScale(12, 0.3), lineHeight: moderateScale(16, 0.3) },
});
