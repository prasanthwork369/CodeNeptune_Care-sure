import { StyleSheet } from 'react-native';
import { moderateScale, scale } from 'react-native-size-matters';

export const styles = StyleSheet.create({
    actionIcon:     { width: scale(28), height: scale(28) },
    actionLabel:    { fontSize: moderateScale(12, 0.3) },
    historyIconBox: { width: scale(40), height: scale(40) },
    historyIcon:    { width: scale(22), height: scale(22) },
    historyTitle:   { fontSize: moderateScale(14, 0.3) },
    historyBadge:   { fontSize: moderateScale(10, 0.2) },
    arrowIcon:      { width: scale(14), height: scale(14) },
});
