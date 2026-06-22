import { StyleSheet } from 'react-native';
import { moderateScale, scale } from 'react-native-size-matters';

export const COUNTER_W   = scale(90);
export const COUNTER_BTN = scale(36);

export const cartStyles = StyleSheet.create({
    // CartItemCounter
    counterPlusMinus: { fontSize: moderateScale(20, 0.3) },
    counterVal:       { fontSize: moderateScale(14, 0.3) },

    // CartItemsList
    itemImgBox:   { width: scale(80), height: scale(80) },
    itemImg:      { width: scale(64), height: scale(64) },
    itemRxBadge:  { width: scale(23), height: scale(23) },
    itemRxText:   { fontSize: moderateScale(11, 0.25) },
    itemTitle:    { fontSize: moderateScale(13, 0.3) },
    itemSub:      { fontSize: moderateScale(12, 0.3) },
    itemDiscount: { fontSize: moderateScale(13, 0.3) },
    itemMrp:      { fontSize: moderateScale(12, 0.3) },
    itemPrice:    { fontSize: moderateScale(15, 0.3) },
    listTitle:    { fontSize: moderateScale(15, 0.3) },

    // CartFooter
    footerLabel:  { fontSize: moderateScale(11, 0.3) },
    footerTotal:  { fontSize: moderateScale(18, 0.3) },
    footerBtn:    { fontSize: moderateScale(15, 0.3) },

    // CartBillSummary
    billIconBox:  { width: scale(36), height: scale(36) },
    billTitle:    { fontSize: moderateScale(14, 0.3) },
    billSub:      { fontSize: moderateScale(12, 0.3) },
    billMrp:      { fontSize: moderateScale(12, 0.3) },
    billTotal:    { fontSize: moderateScale(15, 0.3) },

    // CartWalletSection
    walletIcon:   { width: scale(28), height: scale(28) },
    walletTitle:  { fontSize: moderateScale(14, 0.3) },
    walletSub:    { fontSize: moderateScale(12, 0.3) },

    // CartCoinsSection
    coinsTitle:   { fontSize: moderateScale(14, 0.3) },
    coinsSub:     { fontSize: moderateScale(12, 0.3) },
    coinsCheck:   { width: scale(20), height: scale(20) },
    coinsCheckTxt:{ fontSize: moderateScale(12, 0.3) },

    // CartCouponSection
    couponText:   { fontSize: moderateScale(13, 0.3) },
    couponTitle:  { fontSize: moderateScale(14, 0.3) },

    // CartDeliveringTo
    deliverIconBox: { width: scale(36), height: scale(36) },
    deliverTitle:   { fontSize: moderateScale(14, 0.3) },
    deliverSub:     { fontSize: moderateScale(12, 0.3) },
    deliverChange:  { fontSize: moderateScale(14, 0.3) },

    // CartTerms
    termsCircle: { width: scale(18), height: scale(18) },
    termsText:   { fontSize: moderateScale(12, 0.3) },
    termsBadgeTxt:{ fontSize: moderateScale(11, 0.25) },

    // CouponCard
    couponIconBox:  { width: scale(40), height: scale(40) },
    couponIcon:     { width: scale(22), height: scale(22) },
    couponCardTitle:{ fontSize: moderateScale(14, 0.3) },
    couponCardDesc: { fontSize: moderateScale(12, 0.3) },
    couponCode:     { fontSize: moderateScale(12, 0.3) },
    couponApply:    { fontSize: moderateScale(12, 0.3) },

    // CouponInput
    couponInput:     { fontSize: moderateScale(15, 0.3) },
    couponInputApply:{ fontSize: moderateScale(12, 0.3) },

    // CartFreeDeliveryProgress
    progressText: { fontSize: moderateScale(14, 0.3) },
    progressIcon: { width: scale(22), height: scale(20) },

    // CartSavingsBanner
    savingsText: { fontSize: moderateScale(14, 0.3) },

    // BillDetailsSheet
    billSheetTitle: { fontSize: moderateScale(18, 0.3) },
    billSheetLabel: { fontSize: moderateScale(14, 0.3) },
    billSheetTotal: { fontSize: moderateScale(16, 0.3) },
    billSheetGrand: { fontSize: moderateScale(18, 0.3) },

    // CareSureCoinsSheet
    coinsSheetTitle:   { fontSize: moderateScale(24, 0.3) },
    coinsSheetSub:     { fontSize: moderateScale(16, 0.3) },
    coinsSheetLabel:   { fontSize: moderateScale(16, 0.3) },
    coinsSheetSaved:   { fontSize: moderateScale(14, 0.3) },
    coinsSheetCoinImg: { width: scale(22), height: scale(22) },
    coinsSheetBag:     { width: scale(90), height: scale(90) },

    // CartEmptyState
    emptyLottie:  { width: scale(140), height: scale(140) },
    emptyTitle:   { fontSize: moderateScale(16, 0.3) },
    emptyBtn:     { fontSize: moderateScale(14, 0.3) },
    emptyCard:    { width: scale(165) },
    emptyCardH:   { height: scale(305) },
    emptyImgH:    { height: scale(115) },
    emptyBadge:   { fontSize: moderateScale(10, 0.25) },
    emptyName:    { fontSize: moderateScale(13, 0.25), lineHeight: moderateScale(18, 0.25) },
    emptyBrand:   { fontSize: moderateScale(11, 0.25) },
    emptyPack:    { fontSize: moderateScale(11, 0.25) },
    emptyPrice:   { fontSize: moderateScale(15, 0.25) },
    emptyMrp:     { fontSize: moderateScale(11, 0.25) },
    emptyAddBtn:  { fontSize: moderateScale(14, 0.25) },
    emptySection: { fontSize: moderateScale(16, 0.3) },
});
