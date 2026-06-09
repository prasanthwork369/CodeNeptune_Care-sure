import { useRef, MutableRefObject } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import { useUIStore } from '@/src/store/uiStore';

const HIDE_DELAY_MS = 3000;
const showEasing    = Easing.out(Easing.cubic);
const hideEasing    = Easing.in(Easing.cubic);

export const useHomeScroll = (heroHeightRef: MutableRefObject<number>) => {
    const setTabBarVisible         = useUIStore.getState().setTabBarVisible;
    const setUploadButtonCollapsed = useUIStore.getState().setUploadButtonCollapsed;
    const lastScrollY              = useRef(0);
    const hideTimer                = useRef<ReturnType<typeof setTimeout> | null>(null);
    const timerRunning             = useRef(false);
    const scrollY                  = useSharedValue(0);
    const isTabBarVisibleShared    = useSharedValue(1);
    const stickySearchVisible      = useSharedValue(0);

    const clearHideTimer = () => {
        if (hideTimer.current) {
            clearTimeout(hideTimer.current);
            hideTimer.current = null;
        }
        timerRunning.current = false;
    };

    const showSticky = () => {
        clearHideTimer();
        stickySearchVisible.value = withTiming(1, { duration: 200, easing: showEasing });
    };

    const scheduleHideSticky = () => {
        // Only start a new timer if one isn't already running — prevents blink on continuous scroll
        if (timerRunning.current) return;
        timerRunning.current = true;
        hideTimer.current = setTimeout(() => {
            stickySearchVisible.value = withTiming(0, { duration: 280, easing: hideEasing });
            timerRunning.current = false;
        }, HIDE_DELAY_MS);
    };

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const currentScrollY = event.nativeEvent.contentOffset.y;
        scrollY.value = currentScrollY;
        const delta = currentScrollY - lastScrollY.current;

        if (Math.abs(delta) < 5) return;
        lastScrollY.current = currentScrollY;

        // ── Tab bar + upload button ──────────────────────────────────────────
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

        // ── Sticky search bar ─────────────────────────────────────────────────
        // Threshold = hero section height (dynamically measured) so sticky only
        // appears after the inline search bar has fully scrolled off screen
        const threshold = heroHeightRef.current || 300;

        if (currentScrollY < threshold) {
            // Inline search still visible — hide sticky immediately
            clearHideTimer();
            stickySearchVisible.value = withTiming(0, { duration: 150 });
        } else if (delta < 0) {
            // Scrolling up — show immediately, cancel pending hide
            showSticky();
        } else {
            // Scrolling down past threshold — show once then start 3s countdown
            // Guard: don't re-show or restart timer if bar is already visible & counting
            if (stickySearchVisible.value < 0.5) {
                stickySearchVisible.value = withTiming(1, { duration: 200, easing: showEasing });
            }
            scheduleHideSticky();
        }
    };

    return { scrollY, handleScroll, isTabBarVisibleShared, stickySearchVisible };
};
