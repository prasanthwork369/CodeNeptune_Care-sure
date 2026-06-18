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
export const CARD_WIDTH    = scale(124);
export const CARD_HEIGHT   = scale(110);
export const GRID_GAP      = scale(12);
export const GRID_PADDING  = scale(10);
export const CARD_RADIUS   = scale(10);

export const CARD_IMAGE_WIDTH  = scale(91.34);
export const CARD_IMAGE_HEIGHT = scale(82.02);
export const CARD_IMAGE_LEFT   = scale(35);

export const gridStyles = StyleSheet.create({
    cardLabel: { fontSize: moderateScale(12, 0.25), lineHeight: moderateScale(18, 0.25), letterSpacing: 0 },
    card:      { borderRadius: CARD_RADIUS, overflow: 'hidden', position: 'relative' },
    grid:      { flexDirection: 'row', flexWrap: 'wrap', gap: GRID_GAP },
    column:    { gap: GRID_GAP },
    row:       { flexDirection: 'row', gap: GRID_GAP },
    cardImage: {
        position: 'absolute',
        bottom: scale(-8),
        left: CARD_IMAGE_LEFT,
        width: CARD_IMAGE_WIDTH,
        height: CARD_IMAGE_HEIGHT,
        opacity: 1,
    },
});
