import { StyleSheet } from 'react-native';
import { scale, verticalScale, moderateScale } from '@/src/utils/exactScale';

export const styles = StyleSheet.create({
    title: { fontSize: moderateScale(26, 0.3), lineHeight: moderateScale(34, 0.3) },
    headerContainer: { marginBottom: verticalScale(8) },
});
