import { StyleSheet } from 'react-native';
import { moderateScale, scale } from 'react-native-size-matters';

export const styles = StyleSheet.create({
    wrap: { paddingBottom: moderateScale(16, 0.3) },
    icon: { width: scale(15), height: scale(15) },
    secureText: { fontSize: moderateScale(13, 0.3), fontFamily: 'Inter_500Medium', color: '#637381' },
    policyText: { fontSize: moderateScale(12, 0.3), fontFamily: 'Inter_500Medium', color: '#637381', textAlign: 'center', paddingHorizontal: 8, lineHeight: moderateScale(20, 0.3) },
    link: { color: '#0F7635', fontFamily: 'Inter_500Medium', textDecorationLine: 'underline' },
});
