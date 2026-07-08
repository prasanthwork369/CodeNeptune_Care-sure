import { useCallback } from 'react';
import {
    runOnJS,
    SharedValue,
    useAnimatedScrollHandler,
    useSharedValue,
} from 'react-native-reanimated';
import { useUIStore } from '@/src/store/uiStore';

/**
 * Shows/hides the bottom tab bar and collapses the upload button based on
 * scroll direction. The per-frame scroll work stays on the UI thread; JS is
 * only notified when the visible state actually changes.
 */
export const useTabBarVisibility = (scrollY?: SharedValue<number>) => {
    const lastScrollY               = useSharedValue(0);
    const isTabBarVisibleShared     = useSharedValue(1);

    const applyVisibility = useCallback((visible: boolean) => {
        useUIStore.setState({
            isTabBarVisible: visible,
            isUploadButtonCollapsed: !visible,
        });
    }, []);

    const handleScroll = useAnimatedScrollHandler({
        onScroll: (event) => {
            const currentScrollY = event.contentOffset.y;
            if (scrollY) {
                scrollY.value = currentScrollY;
            }
            const isAtBottom =
                currentScrollY + event.layoutMeasurement.height >=
                event.contentSize.height - 24;

            // Reaching the end of the scrollable content always reveals the
            // tab bar, even if the user got there by scrolling down.
            if (isAtBottom) {
                lastScrollY.value = currentScrollY;
                if (isTabBarVisibleShared.value !== 1) {
                    isTabBarVisibleShared.value = 1;
                    runOnJS(applyVisibility)(true);
                }
                return;
            }

            const delta = currentScrollY - lastScrollY.value;

            if (Math.abs(delta) < 5) return;
            lastScrollY.value = currentScrollY;

            let nextVisible = isTabBarVisibleShared.value;
            if (currentScrollY <= 0) {
                nextVisible = 1;
            } else if (delta > 0 && currentScrollY > 100) {
                nextVisible = 0;
            } else if (delta < 0) {
                nextVisible = 1;
            }

            if (nextVisible !== isTabBarVisibleShared.value) {
                isTabBarVisibleShared.value = nextVisible;
                runOnJS(applyVisibility)(nextVisible === 1);
            }
        },
    });

    return { isTabBarVisibleShared, handleScroll };
};
