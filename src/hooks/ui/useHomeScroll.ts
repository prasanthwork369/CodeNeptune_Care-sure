import { MutableRefObject } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { useTabBarVisibility } from './useTabBarVisibility';
import { useStickySearchBar } from './useStickySearchBar';

/**
 * Combines the Home screen's scroll-driven animations:
 * - tab bar / upload button visibility (useTabBarVisibility)
 * - sticky search bar show/hide (useStickySearchBar)
 *
 * Each concern is implemented in its own hook so they can be fixed
 * independently without affecting one another.
 */
export const useHomeScroll = (heroHeightRef: MutableRefObject<number>) => {
    const scrollY = useSharedValue(0);

    const { isTabBarVisibleShared, handleScroll: handleTabBarScroll } = useTabBarVisibility();
    const { stickySearchVisible, handleScroll: handleStickyScroll } = useStickySearchBar(heroHeightRef);

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const currentScrollY = event.nativeEvent.contentOffset.y;
        scrollY.value = currentScrollY;

        handleTabBarScroll(currentScrollY);
        handleStickyScroll(currentScrollY);
    };

    return { scrollY, handleScroll, isTabBarVisibleShared, stickySearchVisible };
};
