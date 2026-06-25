import { StyleSheet } from 'react-native';
import { exactScale } from '@/src/utils/exactScale';

export const styles = StyleSheet.create({
    title: { fontSize: exactScale(26), lineHeight: exactScale(34) },
    headerContainer: { marginBottom: exactScale(16) },
});
