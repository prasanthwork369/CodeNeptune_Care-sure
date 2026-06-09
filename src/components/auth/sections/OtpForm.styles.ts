import { StyleSheet } from 'react-native';
import { moderateScale, scale } from 'react-native-size-matters';

export const styles = StyleSheet.create({
    boxRow: { marginVertical: moderateScale(12, 0.3) },
    otpInput: { padding: 0, textAlignVertical: 'center', includeFontPadding: false, fontSize: moderateScale(24, 0.3), fontFamily: 'Inter-Bold', color: '#111827', textAlign: 'center', width: '100%', height: '100%' },
    error: { fontSize: moderateScale(13, 0.3), fontFamily: 'Inter-Medium', color: '#EF4444', textAlign: 'center', marginBottom: 8 },
    resendText: { fontSize: moderateScale(13, 0.3), fontFamily: 'Inter-Medium', color: '#637381', paddingVertical: 8 },
    resendHighlight: { color: '#0F7635', fontFamily: 'Inter-Bold' },
    resendBtn: { fontSize: moderateScale(13, 0.3), fontFamily: 'Inter-Bold', color: '#0F7635', textDecorationLine: 'underline' },
    btn: { paddingVertical: moderateScale(13, 0.3), marginVertical: moderateScale(12, 0.3) },
    btnText: { fontSize: moderateScale(16, 0.3), fontFamily: 'Inter-Bold', color: 'white', marginRight: 8 },
    arrow: { width: scale(13), height: scale(13) },
});
