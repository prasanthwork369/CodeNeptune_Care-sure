import { StyleSheet } from 'react-native';
import { moderateScale, scale } from 'react-native-size-matters';

export const styles = StyleSheet.create({
    deliverLabel: { fontSize: moderateScale(12, 0.3) },
    locationText: { fontSize: moderateScale(15, 0.3) },
    iconBtn: { width: scale(40), height: scale(40) },
    walletIcon: { width: moderateScale(24, 0.3), height: moderateScale(24, 0.3) },
    walletBadgeWrap: { minWidth: scale(39) },
    walletBadgeText: { fontSize: moderateScale(10, 0.2) },
    badge: { minWidth: scale(18), height: scale(18) },
    badgeText: { fontSize: moderateScale(10, 0.2) },
});
