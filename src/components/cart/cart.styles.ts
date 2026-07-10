import { StyleSheet } from 'react-native';
import { exactScale, moderateScale } from '@/src/utils/exactScale';

// Widened from 90 -- at 90 the middle quantity slot (90 - 36*2 = 18px) was
// too narrow for 2-digit quantities (10+), causing the number to wrap
// vertically instead of staying on one line.
export const COUNTER_W   = exactScale(100);
export const COUNTER_BTN = exactScale(36);

export const cartStyles = StyleSheet.create({
    // CartItemCounter
    counterPlusMinus: { fontSize: moderateScale(20) },
    counterVal:       { fontSize: moderateScale(14) },

    // CartItemsList
    itemImgBox:   { width: exactScale(80), height: exactScale(80) },
    itemImg:      { width: exactScale(64), height: exactScale(64) },
    itemRxBadge:  { width: exactScale(23), height: exactScale(23) },
    itemRxText:   { fontSize: moderateScale(11) },
    itemTitle:    { fontSize: moderateScale(13) },
    itemSub:      { fontSize: moderateScale(12) },
    itemDiscount: { fontSize: moderateScale(13) },
    itemMrp:      { fontSize: moderateScale(12) },
    itemPrice:    { fontSize: moderateScale(15) },
    listTitle:    { fontSize: moderateScale(15) },

    // CartFooter
    footerLabel:  { fontSize: moderateScale(11) },
    footerTotal:  { fontSize: moderateScale(18) },
    footerBtn:    { fontSize: moderateScale(15) },

    // CartBillSummary
    billIconBox:  { width: exactScale(36), height: exactScale(36) },
    billTitle:    { fontSize: moderateScale(14) },
    billSub:      { fontSize: moderateScale(12) },
    billMrp:      { fontSize: moderateScale(12) },
    billTotal:    { fontSize: moderateScale(15) },

    // CartWalletSection
    walletIcon:   { width: exactScale(28), height: exactScale(28) },
    walletTitle:  { fontSize: moderateScale(14) },
    walletSub:    { fontSize: moderateScale(12) },
    creditsRowDivider: { height: 1, backgroundColor: '#919EAB33' },

    // CartCoinsSection
    coinsTitle:   { fontSize: moderateScale(14) },
    coinsSub:     { fontSize: moderateScale(12) },
    coinsCheck:   { width: exactScale(20), height: exactScale(20) },
    coinsCheckTxt:{ fontSize: moderateScale(12) },

    // CartCouponSection
    couponText:   { fontSize: moderateScale(13) },
    couponTitle:  { fontSize: moderateScale(14) },

    // CartDeliveringTo
    deliverIconBox: { width: exactScale(40), height: exactScale(40) },
    deliverTitle:   { fontSize: moderateScale(15),lineHeight: moderateScale(18) },
    deliverSub:     { fontSize: moderateScale(13),lineHeight: moderateScale(18) },
    deliverChange:  { fontSize: moderateScale(15) },

    // CartTerms
    termsCircle: { width: exactScale(18), height: exactScale(18) },
    termsText:   { fontSize: moderateScale(12) },
    termsBadgeTxt:{ fontSize: moderateScale(11) },

    // CouponCard
    couponIconBox:  { width: exactScale(40), height: exactScale(40) },
    couponIcon:     { width: exactScale(22), height: exactScale(22) },
    couponCardTitle:{ fontSize: moderateScale(14) },
    couponCardDesc: { fontSize: moderateScale(12) },
    couponCode:     { fontSize: moderateScale(12) },
    couponApply:    { fontSize: moderateScale(12) },

    // CouponInput
    couponInput:     { fontSize: moderateScale(15) },
    couponInputApply:{ fontSize: moderateScale(12) },

    // CartFreeDeliveryProgress
    progressText: { fontSize: moderateScale(14) },
    progressIcon: { width: exactScale(22), height: exactScale(20) },

    // CartSavingsBanner
    savingsText: { fontSize: moderateScale(14) },

    // BillDetailsSheet
    billSheetTitle: { fontSize: moderateScale(18) },
    billSheetLabel: { fontSize: moderateScale(14) },
    billSheetTotal: { fontSize: moderateScale(16) },
    billSheetGrand: { fontSize: moderateScale(18) },

    // CareSureCoinsSheet
    coinsSheetTitle:   { fontSize: moderateScale(24) },
    coinsSheetSub:     { fontSize: moderateScale(16) },
    coinsSheetLabel:   { fontSize: moderateScale(16) },
    coinsSheetSaved:   { fontSize: moderateScale(14) },
    coinsSheetCoinImg: { width: exactScale(22), height: exactScale(22) },
    coinsSheetBag:     { width: exactScale(90), height: exactScale(90) },

    // CartEmptyState
    emptyLottie:  { width: exactScale(140), height: exactScale(140) },
    emptyTitle:   { fontSize: moderateScale(16) },
    emptyBtn:     { fontSize: moderateScale(14) },
    emptyCard:    { width: exactScale(165) },
    emptyCardH:   { height: exactScale(305) },
    emptyImgH:    { height: exactScale(115) },
    emptyBadge:   { fontSize: moderateScale(10) },
    emptyName:    { fontSize: moderateScale(13), lineHeight: moderateScale(18) },
    emptyBrand:   { fontSize: moderateScale(11) },
    emptyPack:    { fontSize: moderateScale(11) },
    emptyPrice:   { fontSize: moderateScale(15) },
    emptyMrp:     { fontSize: moderateScale(11) },
    emptyAddBtn:  { fontSize: moderateScale(14) },
    emptySection: { fontSize: moderateScale(16) },
});
