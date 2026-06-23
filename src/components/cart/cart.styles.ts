import { StyleSheet } from 'react-native';
import { moderateScale, scale } from 'react-native-size-matters';

export const COUNTER_W   = scale(90);
export const COUNTER_BTN = scale(36);

export const cartStyles = StyleSheet.create({
    // CartItemCounter
    counterPlusMinus: { fontSize: moderateScale(20, 0.1) },
    counterVal:       { fontSize: moderateScale(14, 0.1) },

    // CartItemsList
    itemImgBox:   { width: scale(80), height: scale(80) },
    itemImg:      { width: scale(64), height: scale(64) },
    itemRxBadge:  { width: scale(23), height: scale(23) },
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
    billIconBox:  { width: scale(36), height: scale(36) },
    billTitle:    { fontSize: moderateScale(14, 0.1) },
    billSub:      { fontSize: moderateScale(12, 0.1) },
    billMrp:      { fontSize: moderateScale(12, 0.1) },
    billTotal:    { fontSize: moderateScale(15, 0.1) },

    // CartWalletSection
    walletIcon:   { width: scale(28), height: scale(28) },
    walletTitle:  { fontSize: moderateScale(14, 0.1) },
    walletSub:    { fontSize: moderateScale(12, 0.1) },

    // CartCoinsSection
    coinsTitle:   { fontSize: moderateScale(14, 0.1) },
    coinsSub:     { fontSize: moderateScale(12, 0.1) },
    coinsCheck:   { width: scale(20), height: scale(20) },
    coinsCheckTxt:{ fontSize: moderateScale(12, 0.1) },

    // CartCouponSection
    couponText:   { fontSize: moderateScale(13, 0.1) },
    couponTitle:  { fontSize: moderateScale(14, 0.1) },

    // CartDeliveringTo
    deliverIconBox: { width: scale(36), height: scale(36) },
    deliverTitle:   { fontSize: moderateScale(14, 0.1) },
    deliverSub:     { fontSize: moderateScale(12, 0.1) },
    deliverChange:  { fontSize: moderateScale(14, 0.1) },

    // CartTerms
    termsCircle: { width: scale(18), height: scale(18) },
    termsText:   { fontSize: moderateScale(12, 0.1) },
    termsBadgeTxt:{ fontSize: moderateScale(11, 0.08) },

    // CouponCard
    couponIconBox:  { width: scale(40), height: scale(40) },
    couponIcon:     { width: scale(22), height: scale(22) },
    couponCardTitle:{ fontSize: moderateScale(14, 0.1) },
    couponCardDesc: { fontSize: moderateScale(12, 0.1) },
    couponCode:     { fontSize: moderateScale(12, 0.1) },
    couponApply:    { fontSize: moderateScale(12, 0.1) },

    // CouponInput
    couponInput:     { fontSize: moderateScale(15, 0.1) },
    couponInputApply:{ fontSize: moderateScale(12, 0.1) },

    // CartFreeDeliveryProgress
    progressText: { fontSize: moderateScale(14, 0.1) },
    progressIcon: { width: scale(22), height: scale(20) },

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
    coinsSheetCoinImg: { width: scale(22), height: scale(22) },
    coinsSheetBag:     { width: scale(90), height: scale(90) },

    // CartEmptyState
    emptyLottie:  { width: scale(140), height: scale(140) },
    emptyTitle:   { fontSize: moderateScale(16, 0.1) },
    emptyBtn:     { fontSize: moderateScale(14, 0.1) },
    emptyCard:    { width: scale(165) },
    emptyCardH:   { height: scale(305) },
    emptyImgH:    { height: scale(115) },
    emptyBadge:   { fontSize: moderateScale(10, 0.08) },
    emptyName:    { fontSize: moderateScale(13, 0.08), lineHeight: moderateScale(18, 0.08) },
    emptyBrand:   { fontSize: moderateScale(11, 0.08) },
    emptyPack:    { fontSize: moderateScale(11, 0.08) },
    emptyPrice:   { fontSize: moderateScale(15, 0.08) },
    emptyMrp:     { fontSize: moderateScale(11, 0.08) },
    emptyAddBtn:  { fontSize: moderateScale(14, 0.08) },
    emptySection: { fontSize: moderateScale(16, 0.1) },
});
