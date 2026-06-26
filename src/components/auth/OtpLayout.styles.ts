import { StyleSheet, Platform } from 'react-native';
import { exactScale, moderateScale } from "@/src/utils/exactScale";

export const styles = StyleSheet.create({
    title: { fontSize: moderateScale(26), fontWeight: '800', color: '#222222', lineHeight: moderateScale(26), letterSpacing: 0 },
    phone: {
        fontSize: moderateScale(14),
        fontWeight: '500',
        color: '#222222',
        lineHeight: moderateScale(30),
        letterSpacing: 0,
        marginRight: exactScale(8),
    },
    editBtn: {
        fontSize: moderateScale(14),
        fontWeight: '600',
        color: '#0F7635',
        lineHeight: moderateScale(30),
        letterSpacing: 0,
        textDecorationLine: 'underline',
    },
    headerContainer: { marginBottom: exactScale(4), paddingHorizontal: exactScale(8) },
    phoneRow: { flexDirection: 'row', alignItems: 'center', marginTop: exactScale(8) },
    spacer: { height: exactScale(24) },
});
