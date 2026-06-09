import { StyleSheet } from 'react-native';
import { moderateScale, scale } from 'react-native-size-matters';

export const styles = StyleSheet.create({
    sectionTitle: { fontSize: moderateScale(14, 0.3) },
    icon:         { width: scale(28), height: scale(28) },
    label:        { fontSize: moderateScale(13, 0.3) },
});
