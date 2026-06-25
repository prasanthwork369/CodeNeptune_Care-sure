import { MutableRefObject, useRef } from 'react';
import { Easing, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Shows the sticky search bar once the inline hero search bar scrolls off
 * screen. Independent from the tab bar / upload button visibility logic.
 */
export const useStickySearchBar = (heroHeightRef: MutableRefObject<number>) => {
    const insets = useSafeAreaInsets();
    const stickySearchVisible = useSharedValue(0);
    // Tracks the last *triggered* state so the timed fade only fires once per
    // crossing, instead of re-driving every scroll event inside the range.
    const isShownRef = useRef(false);

    const handleScroll = (currentScrollY: number) => {
        const heroHeight = heroHeightRef.current || 300;

        // Must match HomeLayout's sticky search container exactly:
        // marginTop: -(insets.top + 8) - 30. That negative margin is what
        // pulls the container up to overlap the hero, so its real top
        // offset in content coordinates -- the scrollY at which
        // react-native's stickyHeaderIndices actually pins it -- is
        // heroHeight + that marginTop, not some separate estimate. Using a
        // different constant here left a gap where the floating header
        // faded in before the inline bar had actually reached the pin
        // point, showing both at once.
        const threshold = heroHeight - insets.top - 8 - 30;
        const shouldShow = currentScrollY >= threshold;

        if (shouldShow !== isShownRef.current) {
            isShownRef.current = shouldShow;
            // Time-based, not scroll-distance-based -- so the fade always
            // takes the same ~220ms regardless of how fast the user flicks
            // past the threshold, instead of snapping within a few pixels.
            stickySearchVisible.value = withTiming(shouldShow ? 1 : 0, {
                duration: 200,
                easing: Easing.out(Easing.quad),
            });
        }
    };

    return { stickySearchVisible, handleScroll };
};

