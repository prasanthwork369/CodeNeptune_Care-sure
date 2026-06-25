import { StyleSheet, Platform } from 'react-native';
import { moderateScale } from 'react-native-size-matters';

export const styles = StyleSheet.create({
    title: { fontSize: moderateScale(26, 0.1), fontWeight: '800', color: '#222222', lineHeight: moderateScale(26, 0.1), letterSpacing: 0 },
    phone: {
        fontSize: moderateScale(14, 0.1),
        fontWeight: '500',
        color: '#222222',
        lineHeight: moderateScale(30, 0.1),
        letterSpacing: 0,
        marginRight: moderateScale(8, 0.3),
    },
    editBtn: {
        fontSize: moderateScale(14, 0.1),
        fontWeight: '600',
        color: '#0F7635',
        lineHeight: moderateScale(30, 0.1),
        letterSpacing: 0,
        textDecorationLine: 'underline',
    },
    headerContainer: { marginBottom: moderateScale(4, 0.3), paddingHorizontal: moderateScale(8, 0.3) },
    phoneRow: { flexDirection: 'row', alignItems: 'center', marginTop: moderateScale(8, 0.3) },
    spacer: { height: moderateScale(24, 0.3) },
});
