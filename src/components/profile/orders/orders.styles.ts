import { StyleSheet } from 'react-native';
import { moderateScale, scale } from 'react-native-size-matters';

// Shared across all order components
export const orderStyles = StyleSheet.create({
    // MyOrdersLayout
    statusBadge:   { fontSize: moderateScale(11, 0.25) },
    labelXs:       { fontSize: moderateScale(10, 0.25) },
    labelSm:       { fontSize: moderateScale(13, 0.3) },
    labelMd:       { fontSize: moderateScale(14, 0.3) },
    labelLg:       { fontSize: moderateScale(15, 0.3) },
    labelXl:       { fontSize: moderateScale(16, 0.3) },
    label20:       { fontSize: moderateScale(20, 0.3) },
    productImg52:  { width: scale(52), height: scale(52) },
    productImg50:  { width: scale(50), height: scale(50) },
    productImg62:  { width: scale(62), height: scale(62) },
    productImg54:  { width: scale(54), height: scale(54) },
    productImg44:  { width: scale(44), height: scale(44) },
    productImg36:  { width: scale(36), height: scale(36) },
    productImg28:  { width: scale(28), height: scale(28) },
    icon20:        { width: scale(20), height: scale(20) },
    icon18:        { width: scale(18), height: scale(18) },
    icon14:        { width: scale(14), height: scale(14) },
    icon24:        { width: scale(24), height: scale(24) },

    // OrderSuccessLayout
    successIcon:   { width: scale(40), height: scale(40) },
    successImg:    { width: scale(160), height: scale(160) },

    // ReturnSuccessModal
    returnSuccessImg: { width: scale(88), height: scale(88) },

    // FrequentlyOrderedLayout counter
    freqCounter:   { width: scale(90) },
    freqCounterBtn:{ width: scale(44), height: scale(44) },
    freqCounterVal:{ fontSize: moderateScale(13, 0.3) },
    freqImgBox:    { width: scale(100), height: scale(100) },
    freqImg:       { width: scale(54), height: scale(54) },
});
