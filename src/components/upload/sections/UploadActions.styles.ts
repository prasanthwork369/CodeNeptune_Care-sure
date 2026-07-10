import { StyleSheet } from 'react-native';
import { exactScale, moderateScale } from '@/src/utils/exactScale';

export const styles = StyleSheet.create({
    actionIcon:     { width: exactScale(28), height: exactScale(28) },
    actionLabel:    { fontSize: moderateScale(12) },
    historyIconBox: { width: exactScale(40), height: exactScale(40) },
    historyIcon:    { width: exactScale(22), height: exactScale(22) },
    historyTitle:   { fontSize: moderateScale(14) },
    historyBadge:   { fontSize: moderateScale(10) },
    arrowIcon:      { width: exactScale(14), height: exactScale(14) },
});
