import { StyleSheet } from 'react-native';
import { moderateScale, scale } from 'react-native-size-matters';

// Shared cart counter used across all search cards
export const COUNTER_WIDTH  = scale(90);
export const COUNTER_BTN_W  = scale(36);

export const cartCounterStyles = StyleSheet.create({
    wrap:       { width: COUNTER_WIDTH },
    btn:        { width: COUNTER_BTN_W, paddingVertical: 6, alignItems: 'center', justifyContent: 'center' },
    addBtn:     { minWidth: scale(72) },
    addText:    { fontSize: moderateScale(14, 0.3) },
    plusMinus:  { fontSize: moderateScale(20, 0.3) },
    countText:  { fontSize: moderateScale(14, 0.3) },
});

export const searchCardStyles = StyleSheet.create({
    name:       { fontSize: moderateScale(14, 0.3) },
    desc:       { fontSize: moderateScale(12, 0.3) },
    price:      { fontSize: moderateScale(18, 0.3) },
    priceSm:    { fontSize: moderateScale(16, 0.3) },
    mrp:        { fontSize: moderateScale(12, 0.3) },
    savings:    { fontSize: moderateScale(12, 0.3) },
    savingsTag: { fontSize: moderateScale(11, 0.3) },
    badge:      { fontSize: moderateScale(12, 0.3) },
    label:      { fontSize: moderateScale(14, 0.3) },
    sameComp:   { fontSize: moderateScale(14, 0.3) },
    checkIcon:  { width: scale(18), height: scale(18) },
    sellIcon:   { width: scale(14), height: scale(14) },
    imgBox:     { width: scale(80), height: scale(80) },
    imgInner:   { width: scale(64), height: scale(64) },
});

export const searchRecentStyles = StyleSheet.create({
    sectionTitle: { fontSize: moderateScale(15, 0.3) },
    clearBtn:     { fontSize: moderateScale(13, 0.3) },
    chipText:     { fontSize: moderateScale(13, 0.3) },
    chipIcon:     { width: scale(14), height: scale(14) },
    trendIcon:    { width: scale(16), height: scale(16) },
});

export const searchCartBarStyles = StyleSheet.create({
    price:    { fontSize: moderateScale(20, 0.3) },
    items:    { fontSize: moderateScale(13, 0.3) },
    btnText:  { fontSize: moderateScale(16, 0.3) },
});

export const trustBadgeStyles = StyleSheet.create({
    sectionTitle: { fontSize: moderateScale(14, 0.3) },
    label:        { fontSize: moderateScale(12, 0.3) },
    value:        { fontSize: moderateScale(14, 0.3) },
    checkIcon:    { width: scale(14), height: scale(14) },
    modiLogo:     { width: scale(90), height: scale(24) },
    ciplaLogo:    { width: scale(60), height: scale(20) },
});

export const logisticsBarStyles = StyleSheet.create({
    text:     { fontSize: moderateScale(12, 0.3) },
    change:   { fontSize: moderateScale(14, 0.3) },
    bagIcon:  { width: scale(20), height: scale(20) },
    locIcon:  { width: scale(18), height: scale(18) },
});
