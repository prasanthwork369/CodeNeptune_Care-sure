import { StyleSheet } from 'react-native';
import { moderateScale, scale } from 'react-native-size-matters';

// CategoryProductCard
export const CARD_BTN_W  = scale(90);
export const CARD_BTN_H  = scale(36);
export const CARD_BTN_SW = scale(28);

export const categoryCardStyles = StyleSheet.create({
    addText:    { color: '#0F7635', fontSize: moderateScale(14, 0.25), fontFamily: 'Inter-Bold' },
    plusMinus:  { color: '#FFFFFF', fontSize: moderateScale(20, 0.25), fontFamily: 'Inter-Medium', lineHeight: moderateScale(22, 0.25) },
    plus:       { color: '#FFFFFF', fontSize: moderateScale(18, 0.25), fontFamily: 'Inter-Medium', lineHeight: moderateScale(22, 0.25) },
    countVal:   { color: '#FFFFFF', fontSize: moderateScale(14, 0.25), fontFamily: 'Inter-Bold' },
    price:      { color: '#FFFFFF', fontSize: moderateScale(13, 0.25), fontFamily: 'Inter-Bold' },
    mrp:        { color: '#919EAB', fontSize: moderateScale(13, 0.25), fontFamily: 'Inter-Regular', textDecorationLine: 'line-through' },
    name:       { fontSize: moderateScale(14, 0.25), fontFamily: 'Inter-SemiBold', color: '#1A1C1E', lineHeight: moderateScale(19, 0.25) },
    desc:       { fontSize: moderateScale(12, 0.25), fontFamily: 'Inter-Medium', color: '#6A6A6A' },
    discount:   { fontSize: moderateScale(12, 0.25), fontFamily: 'Inter-Bold', color: '#22696D', lineHeight: moderateScale(12, 0.25), padding: 4 },
});

// CategoriesSidebar
export const sidebarStyles = StyleSheet.create({
    icon:   { width: scale(28), height: scale(28) },
    iconWrap: { width: scale(40), height: scale(40) },
    label:  { fontSize: moderateScale(12, 0.25) },
});

// CategoriesGrid
export const gridStyles = StyleSheet.create({
    cardLabel: { fontSize: moderateScale(14, 0.25) },
});
