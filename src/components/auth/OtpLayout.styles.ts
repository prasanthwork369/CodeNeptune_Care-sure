import { StyleSheet } from 'react-native';
import { moderateScale } from 'react-native-size-matters';

export const styles = StyleSheet.create({
    title: { fontSize: moderateScale(24, 0.1), fontWeight: '800', color: '#111827', lineHeight: moderateScale(32, 0.1) },
    phone: { fontSize: moderateScale(15, 0.1), fontWeight: '500', color: '#111827', marginRight: 8 },
    editBtn: { fontSize: moderateScale(15, 0.1), fontWeight: '700', color: '#0F7635', textDecorationLine: 'underline' },
});
