import { StyleSheet } from 'react-native';
import { moderateScale } from 'react-native-size-matters';

export const iconSize = moderateScale(52, 0.3);

export const styles = StyleSheet.create({
    title: { fontSize: moderateScale(16, 0.3) },
    icon: { width: iconSize, height: iconSize },
    itemLabel: { fontSize: moderateScale(13, 0.3) },
});
