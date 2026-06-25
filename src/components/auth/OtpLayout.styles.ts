import { StyleSheet, Platform } from 'react-native';
import { exactScale } from "@/src/utils/exactScale";

export const styles = StyleSheet.create({
    title: { fontSize: exactScale(26), fontWeight: '800', color: '#222222', lineHeight: exactScale(26), letterSpacing: 0 },
    phone: {
        fontSize: exactScale(14),
        fontWeight: '500',
        color: '#222222',
        lineHeight: exactScale(30),
        letterSpacing: 0,
        marginRight: exactScale(8),
    },
    editBtn: {
        fontSize: exactScale(14),
        fontWeight: '600',
        color: '#0F7635',
        lineHeight: exactScale(30),
        letterSpacing: 0,
        textDecorationLine: 'underline',
    },
    headerContainer: { marginBottom: exactScale(4), paddingHorizontal: exactScale(8) },
    phoneRow: { flexDirection: 'row', alignItems: 'center', marginTop: exactScale(8) },
    spacer: { height: exactScale(24) },
});
