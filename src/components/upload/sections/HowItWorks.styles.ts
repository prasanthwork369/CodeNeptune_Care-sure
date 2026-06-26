import { StyleSheet } from 'react-native';
import { exactScale, moderateScale } from '@/src/utils/exactScale';

export const styles = StyleSheet.create({
    sectionTitle: { fontSize: moderateScale(14, 0.1) },
    stepCircle:   { width: exactScale(32), height: exactScale(32) },
    stepNumber:   { fontSize: moderateScale(14, 0.1) },
    stepLabel:    { fontSize: moderateScale(12, 0.1), lineHeight: moderateScale(16, 0.1) },
});
