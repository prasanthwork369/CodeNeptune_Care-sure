import { MutableRefObject } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Shows the sticky search bar once the inline hero search bar scrolls off
 * screen. Independent from the tab bar / upload button visibility logic.
 */
export const useStickySearchBar = (heroHeightRef: MutableRefObject<number>) => {
    const insets = useSafeAreaInsets();
    const stickySearchVisible = useSharedValue(0);

    const handleScroll = (currentScrollY: number) => {
        const searchBarHeight = 56;
        const heroHeight = heroHeightRef.current || 300;
        
        // Threshold where the top of the inline search bar meets the top status bar cover (insets.top + 8)
        const threshold = heroHeight - searchBarHeight - insets.top - 8;
        const fadeRange = 15;

        if (currentScrollY < threshold) {
            stickySearchVisible.value = 0;
        } else if (currentScrollY > threshold + fadeRange) {
            stickySearchVisible.value = 1;
        } else {
            stickySearchVisible.value = (currentScrollY - threshold) / fadeRange;
        }
    };

    return { stickySearchVisible, handleScroll };
};

