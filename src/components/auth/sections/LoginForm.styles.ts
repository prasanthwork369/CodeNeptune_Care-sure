import { StyleSheet } from 'react-native';
import { moderateScale, scale } from 'react-native-size-matters';

export const styles = StyleSheet.create({
    inputWrap: { height: moderateScale(52, 0.3), marginTop: moderateScale(14, 0.3) },
    prefix: { fontSize: moderateScale(17, 0.1), fontWeight: '500', color: '#111827' },
    input: { height: '100%', paddingVertical: 0, fontSize: moderateScale(17, 0.1) },
    error: { fontSize: moderateScale(13, 0.1), fontWeight: '500', color: '#EF4444', marginTop: 6, marginBottom: 4, paddingHorizontal: 4 },
    btn: { paddingVertical: moderateScale(13, 0.3), marginVertical: moderateScale(16, 0.3) },
    btnText: { fontSize: moderateScale(16, 0.1), fontWeight: '700', color: 'white', marginRight: 8 },
    arrow: { width: scale(13), height: scale(13) },
});
