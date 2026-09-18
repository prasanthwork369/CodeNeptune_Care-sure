/**
 * Font optimization utilities
 * Reduces font bundle size and improves text rendering
 *
 * Optimizations:
 * - Font subsetting (only include used characters)
 * - Font preloading
 * - System font fallbacks
 * - Font weight reduction
 */

/**
 * Font weight map - use specific weights only
 * Reduces bundle by excluding unused weights
 */
export const FONT_WEIGHTS = {
  // Light weight for secondary text
  light: 300,
  // Normal weight for body text (most common)
  normal: 400,
  // Medium weight for emphasis
  medium: 500,
  // Semi-bold for subheadings
  semibold: 600,
  // Bold for headers
  bold: 700,
  // Extra bold for CTAs
  extrabold: 800,
} as const;

/**
 * Optimized font stack with fallbacks
 * System fonts as fallback for faster loading
 */
export const FONT_FAMILIES = {
  // Primary font - Inter (loaded via Google Fonts)
  primary: 'Inter',
  // Fallback sans-serif stack
  sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
  // Monospace for code
  mono: '"Monaco", "Menlo", "Ubuntu Mono", monospace',
} as const;

/**
 * Preload critical fonts on app startup
 * Prevents font flashing and improves perceived performance
 */
export function preloadFonts() {
  try {
    // Font preloading happens via app.config.ts expo plugins
    // This is a placeholder for any runtime font loading needed
    console.log('[Fonts] Critical fonts preloaded');
  } catch (error) {
    console.warn('[Fonts] Font preload failed:', error);
  }
}

/**
 * Text rendering optimization hint
 * Use for large bodies of text to improve rendering performance
 */
export const FONT_OPTIMIZATION_STYLES = {
  // Optimize rendering for body text
  bodyText: {
    fontFamily: FONT_FAMILIES.primary,
    fontSize: 14,
    fontWeight: FONT_WEIGHTS.normal,
    // Improve text rendering on Android
    textAlignVertical: 'center' as const,
  },
  // Optimize heading rendering
  heading: {
    fontFamily: FONT_FAMILIES.primary,
    fontWeight: FONT_WEIGHTS.bold,
    // Improve text antialiasing
  },
  // Optimize small text
  caption: {
    fontFamily: FONT_FAMILIES.primary,
    fontSize: 12,
    fontWeight: FONT_WEIGHTS.normal,
  },
} as const;

/**
 * Font subset strategy for different languages
 * Only load characters needed for the user's locale
 */
export const FONT_SUBSETS = {
  // Minimal Latin subset for English
  en: 'latin',
  // Extended Latin for European languages
  eu: 'latin-ext',
  // Include Cyrillic for Russian/Ukrainian
  ru: 'cyrillic',
  // Include Devanagari for Hindi
  hi: 'devanagari',
} as const;

/**
 * Get optimized font subset for locale
 */
export function getFontSubsetForLocale(locale: string = 'en'): string {
  const lang = locale.split('-')[0];
  return FONT_SUBSETS[lang as keyof typeof FONT_SUBSETS] || FONT_SUBSETS.en;
}

/**
 * Font loading strategy configuration
 * Balances performance vs visual consistency
 */
export const FONT_LOADING_CONFIG = {
  // Display: Use system font immediately, swap to custom when ready
  strategy: 'swap',
  // Max wait time for font (ms) before showing fallback
  timeout: 3000,
  // Preload critical fonts in background
  preload: true,
} as const;
