import { Extrapolation, interpolate, SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const useScrollStatusBar = (scrollY: SharedValue<number>) => {
    const insets = useSafeAreaInsets();

    const safeAreaBgStyle = useAnimatedStyle(() => {
        const opacity = interpolate(scrollY.value, [0, 50], [0, 1], Extrapolation.CLAMP);
        return {
            opacity,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: insets.top,
            backgroundColor: 'white',
            zIndex: 101,
        };
    });

    return { safeAreaBgStyle };
};
