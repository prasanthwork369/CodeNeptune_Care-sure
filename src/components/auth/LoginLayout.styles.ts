import { StyleSheet } from 'react-native';
import { moderateScale } from 'react-native-size-matters';

export const styles = StyleSheet.create({
    title: { fontSize: moderateScale(26, 0.1), lineHeight: moderateScale(34, 0.1) },
    headerContainer: { marginBottom: moderateScale(16, 0.3) },
});
