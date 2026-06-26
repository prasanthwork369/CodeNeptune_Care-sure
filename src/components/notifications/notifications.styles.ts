import { StyleSheet } from 'react-native';
import { exactScale, moderateScale } from '@/src/utils/exactScale';

export const styles = StyleSheet.create({
    // NotificationCard
    cardIconBox: { width: exactScale(48), height: exactScale(48) },
    cardIcon:    { width: exactScale(24), height: exactScale(24) },
    cardAmtImg:  { width: exactScale(20), height: exactScale(20) },
    cardTitle:   { fontSize: moderateScale(16, 0.1) },
    cardDate:    { fontSize: moderateScale(12, 0.1) },
    cardAmount:  { fontSize: moderateScale(16, 0.1) },

    // NotificationsLayout
    clearBtn:    { fontSize: moderateScale(13, 0.1) },
    rxIconBox:   { width: exactScale(40), height: exactScale(40) },
    rxIcon:      { width: exactScale(24), height: exactScale(24) },
    rxTitle:     { fontSize: moderateScale(14, 0.1), fontWeight: '600', color: '#1A1C1E', marginBottom: exactScale(2) },
    rxSub:       { fontSize: moderateScale(12, 0.1), fontWeight: '400', color: '#6A6A6A' },
    rxChip:      { fontSize: moderateScale(11, 0.08), fontWeight: '600' },
    emptyIcon:   { width: exactScale(48), height: exactScale(48) },
    emptyTitle:  { fontSize: moderateScale(15, 0.1) },
    emptySub:    { fontSize: moderateScale(13, 0.1) },
    notifIconBox:{ width: exactScale(40), height: exactScale(40) },
    notifIcon:   { width: exactScale(20), height: exactScale(20) },
    notifTitle:  { fontSize: moderateScale(14, 0.1), lineHeight: moderateScale(20, 0.1), fontWeight: '600', color: '#222222', letterSpacing: 0 },
    notifBody:   { fontSize: moderateScale(12, 0.1), lineHeight: moderateScale(12, 0.1), fontWeight: '400', color: '#6A6A6A', letterSpacing: 0 },
    notifTime:   { fontSize: moderateScale(10, 0.08), lineHeight: moderateScale(10, 0.08), fontWeight: '500', color: '#ADABAB', letterSpacing: 0 },

    // Section header (TODAY / YESTERDAY / THIS WEEK)
    sectionHeader: { fontSize: moderateScale(14, 0.1), lineHeight: moderateScale(14, 0.1) },

    // Unread dot
    unreadDot: { width: exactScale(7), height: exactScale(7) },

    // Options popover (Clear / Mark as read)
    popoverWidth:   { width: exactScale(190) },
    popoverIcon:    { width: exactScale(13), height: exactScale(13) },
    popoverIconAlt: { width: exactScale(18), height: exactScale(18) },
    popoverText:    { fontSize: moderateScale(15, 0.1) },

    // 3-dot trigger
    dotsIcon: { width: exactScale(4), height: exactScale(15) },
});
