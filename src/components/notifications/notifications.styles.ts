import { StyleSheet } from 'react-native';
import { moderateScale, scale } from 'react-native-size-matters';

export const styles = StyleSheet.create({
    // NotificationCard
    cardIconBox: { width: scale(48), height: scale(48) },
    cardIcon:    { width: scale(24), height: scale(24) },
    cardAmtImg:  { width: scale(20), height: scale(20) },
    cardTitle:   { fontSize: moderateScale(16, 0.3) },
    cardDate:    { fontSize: moderateScale(12, 0.3) },
    cardAmount:  { fontSize: moderateScale(16, 0.3) },

    // NotificationsLayout
    clearBtn:    { fontSize: moderateScale(13, 0.3) },
    rxIconBox:   { width: scale(40), height: scale(40) },
    rxIcon:      { width: scale(24), height: scale(24) },
    rxTitle:     { fontSize: moderateScale(14, 0.3), fontFamily: 'Inter-SemiBold', color: '#1A1C1E', marginBottom: 2 },
    rxSub:       { fontSize: moderateScale(12, 0.3), fontFamily: 'Inter-Regular', color: '#6A6A6A' },
    rxChip:      { fontSize: moderateScale(11, 0.25), fontFamily: 'Inter-SemiBold' },
    emptyIcon:   { width: scale(48), height: scale(48) },
    emptyTitle:  { fontSize: moderateScale(15, 0.3) },
    emptySub:    { fontSize: moderateScale(13, 0.3) },
    notifIconBox:{ width: scale(40), height: scale(40) },
    notifIcon:   { width: scale(20), height: scale(20) },
    notifTitle:  { fontSize: moderateScale(14, 0.3) },
    notifBody:   { fontSize: moderateScale(13, 0.3) },
    notifTime:   { fontSize: moderateScale(11, 0.25) },
});
