import { useDerivedValue, SharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Shows the sticky search bar once the inline hero search bar scrolls off
 * screen. Independent from the tab bar / upload button visibility logic.
 */
export const useStickySearchBar = (scrollY: SharedValue<number>, heroHeightShared: SharedValue<number>) => {
    const insets = useSafeAreaInsets();
    
    const stickySearchVisible = useDerivedValue(() => {
        const heroHeight = heroHeightShared.value || 300;

        // Must match HomeLayout's sticky search container exactly:
        // marginTop: -(insets.top + 8) - 30. That negative margin is what
        // pulls the container up to overlap the hero, so its real top
        // offset in content coordinates.
        const threshold = heroHeight - insets.top - 8 - 30;
        const fadeRange = 15; // pixels over which to fade from 0 to 1

        if (scrollY.value < threshold) {
            return 0;
        } else if (scrollY.value > threshold + fadeRange) {
            return 1;
        } else {
            return (scrollY.value - threshold) / fadeRange;
        }
    }, [insets, scrollY, heroHeightShared]);

    return { stickySearchVisible };
};

