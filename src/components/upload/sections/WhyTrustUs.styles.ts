import { StyleSheet } from 'react-native';
import { exactScale, moderateScale } from '@/src/utils/exactScale';

export const styles = StyleSheet.create({
    sectionTitle: { fontSize: moderateScale(14) },
    icon:         { width: exactScale(28), height: exactScale(28) },
    label:        { fontSize: moderateScale(13) },
});
