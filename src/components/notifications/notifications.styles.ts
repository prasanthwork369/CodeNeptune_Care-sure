import { StyleSheet } from 'react-native';
import { moderateScale, scale } from 'react-native-size-matters';

export const styles = StyleSheet.create({
    // NotificationCard
    cardIconBox: { width: scale(48), height: scale(48) },
    cardIcon:    { width: scale(24), height: scale(24) },
    cardAmtImg:  { width: scale(20), height: scale(20) },
    cardTitle:   { fontSize: moderateScale(16, 0.1) },
    cardDate:    { fontSize: moderateScale(12, 0.1) },
    cardAmount:  { fontSize: moderateScale(16, 0.1) },

    // NotificationsLayout
    clearBtn:    { fontSize: moderateScale(13, 0.1) },
    rxIconBox:   { width: scale(40), height: scale(40) },
    rxIcon:      { width: scale(24), height: scale(24) },
    rxTitle:     { fontSize: moderateScale(14, 0.1), fontWeight: '600', color: '#1A1C1E', marginBottom: 2 },
    rxSub:       { fontSize: moderateScale(12, 0.1), fontWeight: '400', color: '#6A6A6A' },
    rxChip:      { fontSize: moderateScale(11, 0.08), fontWeight: '600' },
    emptyIcon:   { width: scale(48), height: scale(48) },
    emptyTitle:  { fontSize: moderateScale(15, 0.1) },
    emptySub:    { fontSize: moderateScale(13, 0.1) },
    notifIconBox:{ width: scale(40), height: scale(40) },
    notifIcon:   { width: scale(20), height: scale(20) },
    notifTitle:  { fontSize: moderateScale(14, 0.1), lineHeight: moderateScale(20, 0.1), fontWeight: '600', color: '#222222', letterSpacing: 0 },
    notifBody:   { fontSize: moderateScale(12, 0.1), lineHeight: moderateScale(12, 0.1), fontWeight: '400', color: '#6A6A6A', letterSpacing: 0 },
    notifTime:   { fontSize: moderateScale(10, 0.08), lineHeight: moderateScale(10, 0.08), fontWeight: '500', color: '#ADABAB', letterSpacing: 0 },

    // Section header (TODAY / YESTERDAY / THIS WEEK)
    sectionHeader: { fontSize: moderateScale(14, 0.1), lineHeight: moderateScale(14, 0.1) },

    // Unread dot
    unreadDot: { width: scale(7), height: scale(7) },

    // Options popover (Clear / Mark as read)
    popoverWidth:   { width: scale(190) },
    popoverIcon:    { width: scale(13), height: scale(13) },
    popoverIconAlt: { width: scale(18), height: scale(18) },
    popoverText:    { fontSize: moderateScale(15, 0.1) },

    // 3-dot trigger
    dotsIcon: { width: scale(4), height: scale(15) },
});
