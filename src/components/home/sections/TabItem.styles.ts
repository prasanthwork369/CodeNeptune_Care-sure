import { StyleSheet } from 'react-native';
import { moderateScale } from 'react-native-size-matters';

export const styles = StyleSheet.create({
    iconWrap: { width: moderateScale(40, 0.3), height: moderateScale(40, 0.3) },
    icon: { width: moderateScale(28, 0.3), height: moderateScale(28, 0.3) },
    emoji: { fontSize: moderateScale(28, 0.3) },
    label: { fontSize: moderateScale(13, 0.3) },
});
