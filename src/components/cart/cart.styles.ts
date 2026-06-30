import { StyleSheet } from 'react-native';
import { exactScale, moderateScale } from '@/src/utils/exactScale';

// Widened from 90 -- at 90 the middle quantity slot (90 - 36*2 = 18px) was
// too narrow for 2-digit quantities (10+), causing the number to wrap
// vertically instead of staying on one line.
export const COUNTER_W   = exactScale(100);
export const COUNTER_BTN = exactScale(36);

export const cartStyles = StyleSheet.create({
    // CartItemCounter
    counterPlusMinus: { fontSize: moderateScale(20, 0.1) },
    counterVal:       { fontSize: moderateScale(14, 0.1) },

    // CartItemsList
    itemImgBox:   { width: exactScale(80), height: exactScale(80) },
    itemImg:      { width: exactScale(64), height: exactScale(64) },
    itemRxBadge:  { width: exactScale(23), height: exactScale(23) },
    itemRxText:   { fontSize: moderateScale(11, 0.08) },
    itemTitle:    { fontSize: moderateScale(13, 0.1) },
    itemSub:      { fontSize: moderateScale(12, 0.1) },
    itemDiscount: { fontSize: moderateScale(13, 0.1) },
    itemMrp:      { fontSize: moderateScale(12, 0.1) },
    itemPrice:    { fontSize: moderateScale(15, 0.1) },
    listTitle:    { fontSize: moderateScale(15, 0.1) },

    // CartFooter
    footerLabel:  { fontSize: moderateScale(11, 0.1) },
    footerTotal:  { fontSize: moderateScale(18, 0.1) },
    footerBtn:    { fontSize: moderateScale(15, 0.1) },

    // CartBillSummary
    billIconBox:  { width: exactScale(36), height: exactScale(36) },
    billTitle:    { fontSize: moderateScale(14, 0.1) },
    billSub:      { fontSize: moderateScale(12, 0.1) },
    billMrp:      { fontSize: moderateScale(12, 0.1) },
    billTotal:    { fontSize: moderateScale(15, 0.1) },

    // CartWalletSection
    walletIcon:   { width: exactScale(28), height: exactScale(28) },
    walletTitle:  { fontSize: moderateScale(14, 0.1) },
    walletSub:    { fontSize: moderateScale(12, 0.1) },
    creditsRowDivider: { height: 1, backgroundColor: '#919EAB33' },

    // CartCoinsSection
    coinsTitle:   { fontSize: moderateScale(14, 0.1) },
    coinsSub:     { fontSize: moderateScale(12, 0.1) },
    coinsCheck:   { width: exactScale(20), height: exactScale(20) },
    coinsCheckTxt:{ fontSize: moderateScale(12, 0.1) },

    // CartCouponSection
    couponText:   { fontSize: moderateScale(13, 0.1) },
    couponTitle:  { fontSize: moderateScale(14, 0.1) },

    // CartDeliveringTo
    deliverIconBox: { width: exactScale(36), height: exactScale(36) },
    deliverTitle:   { fontSize: moderateScale(14, 0.1) },
    deliverSub:     { fontSize: moderateScale(12, 0.1) },
    deliverChange:  { fontSize: moderateScale(14, 0.1) },

    // CartTerms
    termsCircle: { width: exactScale(18), height: exactScale(18) },
    termsText:   { fontSize: moderateScale(12, 0.1) },
    termsBadgeTxt:{ fontSize: moderateScale(11, 0.08) },

    // CouponCard
    couponIconBox:  { width: exactScale(40), height: exactScale(40) },
    couponIcon:     { width: exactScale(22), height: exactScale(22) },
    couponCardTitle:{ fontSize: moderateScale(14, 0.1) },
    couponCardDesc: { fontSize: moderateScale(12, 0.1) },
    couponCode:     { fontSize: moderateScale(12, 0.1) },
    couponApply:    { fontSize: moderateScale(12, 0.1) },

    // CouponInput
    couponInput:     { fontSize: moderateScale(15, 0.1) },
    couponInputApply:{ fontSize: moderateScale(12, 0.1) },

    // CartFreeDeliveryProgress
    progressText: { fontSize: moderateScale(14, 0.1) },
    progressIcon: { width: exactScale(22), height: exactScale(20) },

    // CartSavingsBanner
    savingsText: { fontSize: moderateScale(14, 0.1) },

    // BillDetailsSheet
    billSheetTitle: { fontSize: moderateScale(18, 0.1) },
    billSheetLabel: { fontSize: moderateScale(14, 0.1) },
    billSheetTotal: { fontSize: moderateScale(16, 0.1) },
    billSheetGrand: { fontSize: moderateScale(18, 0.1) },

    // CareSureCoinsSheet
    coinsSheetTitle:   { fontSize: moderateScale(24, 0.1) },
    coinsSheetSub:     { fontSize: moderateScale(16, 0.1) },
    coinsSheetLabel:   { fontSize: moderateScale(16, 0.1) },
    coinsSheetSaved:   { fontSize: moderateScale(14, 0.1) },
    coinsSheetCoinImg: { width: exactScale(22), height: exactScale(22) },
    coinsSheetBag:     { width: exactScale(90), height: exactScale(90) },

    // CartEmptyState
    emptyLottie:  { width: exactScale(140), height: exactScale(140) },
    emptyTitle:   { fontSize: moderateScale(16, 0.1) },
    emptyBtn:     { fontSize: moderateScale(14, 0.1) },
    emptyCard:    { width: exactScale(165) },
    emptyCardH:   { height: exactScale(305) },
    emptyImgH:    { height: exactScale(115) },
    emptyBadge:   { fontSize: moderateScale(10, 0.08) },
    emptyName:    { fontSize: moderateScale(13, 0.08), lineHeight: moderateScale(18, 0.08) },
    emptyBrand:   { fontSize: moderateScale(11, 0.08) },
    emptyPack:    { fontSize: moderateScale(11, 0.08) },
    emptyPrice:   { fontSize: moderateScale(15, 0.08) },
    emptyMrp:     { fontSize: moderateScale(11, 0.08) },
    emptyAddBtn:  { fontSize: moderateScale(14, 0.08) },
    emptySection: { fontSize: moderateScale(16, 0.1) },
});
