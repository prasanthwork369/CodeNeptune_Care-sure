import { useCallback, useEffect, useRef } from 'react';
import { BackHandler, Platform, useWindowDimensions } from 'react-native';
import {
    Easing,
    Extrapolation,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { HeroRect, useHeroTransitionStore } from '@/src/store/heroTransitionStore';

// Open: fast launch → smooth decelerate (Material emphasized-decelerate)
const OPEN_DURATION = 420;
const OPEN_EASING = Easing.bezier(0.05, 0.7, 0.1, 1.0);

// Close: quick accelerate → snap back (Material emphasized-accelerate)
const CLOSE_DURATION = 260;
const CLOSE_EASING = Easing.bezier(0.3, 0.0, 0.8, 0.15);

// Navigate slightly before animation fully ends
const CLOSE_TIMEOUT_MS = CLOSE_DURATION - 30;

export const useProductHeroAnimation = (onBack: () => void) => {
    const { width: screenW, height: screenH } = useWindowDimensions();
    const { clear } = useHeroTransitionStore();

    const snap = useRef<HeroRect | null>(useHeroTransitionStore.getState().originRect).current;

    const onBackRef = useRef(onBack);
    useEffect(() => { onBackRef.current = onBack; }, [onBack]);

    const progress = useSharedValue(snap ? 0 : 1);
    const screenOpacity = useSharedValue(snap ? 1 : 0);

    useEffect(() => {
        if (snap) {
            progress.value = withTiming(1, { duration: OPEN_DURATION, easing: OPEN_EASING });
        } else {
            screenOpacity.value = withTiming(1, { duration: 240, easing: Easing.out(Easing.quad) });
        }
        return () => { clear(); };
    }, []);

    const handleBack = useCallback(() => {
        progress.value = withTiming(0, { duration: CLOSE_DURATION, easing: CLOSE_EASING });
        screenOpacity.value = withTiming(0, { duration: CLOSE_TIMEOUT_MS, easing: Easing.in(Easing.quad) });
        setTimeout(() => { onBackRef.current(); }, CLOSE_TIMEOUT_MS);
    }, []);

    useEffect(() => {
        if (Platform.OS !== 'android') return;
        const sub = BackHandler.addEventListener('hardwareBackPress', () => {
            handleBack();
            return true;
        });
        return () => sub.remove();
    }, [handleBack]);

    // Expanding container — animates from card rect to full screen
    const containerStyle = useAnimatedStyle(() => {
        'worklet';
        if (!snap) {
            return { position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0 };
        }
        const snapBottom = screenH - snap.y - snap.height;
        return {
            position: 'absolute' as const,
            top:    interpolate(progress.value, [0, 1], [snap.y,      0],          Extrapolation.CLAMP),
            left:   interpolate(progress.value, [0, 1], [snap.x,      0],          Extrapolation.CLAMP),
            width:  interpolate(progress.value, [0, 1], [snap.width,  screenW],    Extrapolation.CLAMP),
            bottom: interpolate(progress.value, [0, 1], [snapBottom,  0],          Extrapolation.CLAMP),
            borderRadius: interpolate(progress.value, [0, 1], [14, 0],             Extrapolation.CLAMP),
            overflow: 'hidden' as const,
        };
    });

    // Content fades in once container is large enough
    const contentStyle = useAnimatedStyle(() => {
        'worklet';
        return {
            flex: 1,
            opacity: interpolate(progress.value, [0, 0.55, 1], [0, 0, 1], Extrapolation.CLAMP),
        };
    });

    // Backdrop dims the screen behind the expanding card
    const backdropStyle = useAnimatedStyle(() => {
        'worklet';
        return {
            opacity: interpolate(progress.value, [0, 0.45], [0, 1], Extrapolation.CLAMP),
        };
    });

    const screenStyle = useAnimatedStyle(() => ({ opacity: screenOpacity.value }));

    return { containerStyle, contentStyle, backdropStyle, screenStyle, handleBack };
};
