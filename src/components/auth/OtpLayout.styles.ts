import { StyleSheet } from 'react-native';
import { moderateScale } from 'react-native-size-matters';

export const styles = StyleSheet.create({
    title: { fontSize: moderateScale(24, 0.3), fontFamily: 'Inter-ExtraBold', color: '#111827', lineHeight: moderateScale(32, 0.3) },
    phone: { fontSize: moderateScale(15, 0.3), fontFamily: 'Inter-Medium', color: '#111827', marginRight: 8 },
    editBtn: { fontSize: moderateScale(15, 0.3), fontFamily: 'Inter-Bold', color: '#0F7635', textDecorationLine: 'underline' },
});
