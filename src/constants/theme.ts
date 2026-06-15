import { moderateScale } from "react-native-size-matters";

// Standard height for "Add to Cart" / "+ Add" buttons across product cards
export const CART_BUTTON_HEIGHT = moderateScale(14, 0.25) * 2.8;

export const colors = {
    // Brand Colors
    primary: "#0F7635",       // Official Caresure Green
    secondary: "#FACA15",     // Accent Yellow
    
    // Neutrals
    text: "#222222",          // Primary Text
    subtext: "#6A6A6A",       // Secondary/Muted Text
    background: "#F9FAFB",    // Screen Background
    white: "#FFFFFF",
    
    // UI Elements
    border: "#919EAB33",      // Soft Borders
    card: "#FFFFFF",
    success: "#0F7635",
    error: "#DC2626",
    
    // Animated Background Palette
    pastels: [
        '#FFEBEB', // Soft Pink
        '#EBF5FF', // Soft Blue
        '#F5EBFF', // Soft Purple
        '#EBFFFF', // Soft Cyan
        '#FFF9EB', // Soft Yellow
        '#F2FFEB', // Soft Mint
    ]
} as const;

export const spacing = {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    9: 36,
    10: 40,
    11: 44,
    12: 48,
    14: 56,
    16: 64,
    18: 72,
    20: 80,
    24: 96,
    30: 120,
} as const;

export const components = {
    tabBar: {
        height: spacing[18],
        horizontalInset: spacing[5],
        radius: spacing[8],
        iconFrame: spacing[12],
        itemPaddingVertical: spacing[2],
    },
} as const;

export const theme = {
    colors,
    spacing,
    components,
} as const;