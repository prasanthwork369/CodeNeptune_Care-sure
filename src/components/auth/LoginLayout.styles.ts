import { StyleSheet } from 'react-native';
import { verticalScale, moderateScale } from '@/src/utils/exactScale';

export const styles = StyleSheet.create({
    title: { fontSize: moderateScale(26), lineHeight: moderateScale(34) },
    headerContainer: { marginBottom: verticalScale(8) },
});
