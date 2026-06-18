import { useRef } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import { useUIStore } from '@/src/store/uiStore';

/**
 * Shows/hides the bottom tab bar and collapses the upload button based on
 * scroll direction. Independent from the sticky search bar logic.
 */
export const useTabBarVisibility = () => {
    const setTabBarVisible         = useUIStore.getState().setTabBarVisible;
    const setUploadButtonCollapsed = useUIStore.getState().setUploadButtonCollapsed;
    const lastScrollY               = useRef(0);
    const isTabBarVisibleShared     = useSharedValue(1);

    const handleScroll = (currentScrollY: number, isAtBottom = false) => {
        // Reaching the end of the scrollable content always reveals the tab
        // bar, even if the user got there by scrolling down.
        if (isAtBottom) {
            lastScrollY.current = currentScrollY;
            setTabBarVisible(true);
            setUploadButtonCollapsed(false);
            isTabBarVisibleShared.value = 1;
            return;
        }

        const delta = currentScrollY - lastScrollY.current;

        if (Math.abs(delta) < 5) return;
        lastScrollY.current = currentScrollY;

        if (currentScrollY <= 0) {
            setTabBarVisible(true);
            setUploadButtonCollapsed(false);
            isTabBarVisibleShared.value = 1;
        } else if (delta > 0 && currentScrollY > 100) {
            setTabBarVisible(false);
            setUploadButtonCollapsed(true);
            isTabBarVisibleShared.value = 0;
        } else if (delta < 0) {
            setTabBarVisible(true);
            setUploadButtonCollapsed(false);
            isTabBarVisibleShared.value = 1;
        }
    };

    return { isTabBarVisibleShared, handleScroll };
};
