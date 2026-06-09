import { StyleSheet } from 'react-native';
import { moderateScale } from 'react-native-size-matters';

export const styles = StyleSheet.create({
    iconBox: { width: moderateScale(44, 0.3), height: moderateScale(44, 0.3) },
    iconImg: { width: moderateScale(22, 0.3), height: moderateScale(22, 0.3) },
    label: { fontSize: moderateScale(13, 0.3) },
});
