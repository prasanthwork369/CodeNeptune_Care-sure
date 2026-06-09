import { useNav } from '@/src/hooks/useNav';
import { Touchable } from '@/src/components/ui/Touchable';
import React from 'react';
import Animated, {
    SharedValue,
    useAnimatedProps,
    useAnimatedStyle,
    interpolate,
    Extrapolation,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useScrollStatusBar } from '@/src/hooks/ui/useScrollStatusBar';
import { icons } from '@/src/constants/icons';
import { SearchBar } from './SearchBar';

interface HomeStickyHeaderProps {
    scrollY: SharedValue<number>;
    stickySearchVisible: SharedValue<number>;
}

export const HomeStickyHeader: React.FC<HomeStickyHeaderProps> = ({ scrollY, stickySearchVisible }) => {
    const insets = useSafeAreaInsets();
    const router = useNav();
    const { safeAreaBgStyle } = useScrollStatusBar(scrollY);

    const stickySearchStyle = useAnimatedStyle(() => {
        const v = stickySearchVisible.value;
        return {
            opacity: v,
            transform: [{ translateY: interpolate(v, [0, 1], [-56, 0], Extrapolation.CLAMP) }],
            position: 'absolute',
            top: insets.top,
            left: 0,
            right: 0,
            zIndex: 100,
            backgroundColor: '#fff',
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderBottomWidth: 1,
            borderBottomColor: '#F0F1F3',
            shadowColor: '#919EAB',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
        };
    });

    const stickySearchProps = useAnimatedProps(() => ({
        pointerEvents: stickySearchVisible.value > 0.5 ? ('auto' as const) : ('none' as const),
    }));

    return (
        <>
            <Animated.View style={safeAreaBgStyle} />
            <Animated.View style={stickySearchStyle} animatedProps={stickySearchProps}>
                <SearchBar
                    placeholder="Search medicines & health products"
                    words={[
                        'Search affordable substitute',
                        'Search by medicine name',
                        'Search by brand or generic',
                        'Search prescriptions & refills',
                    ]}
                    onPress={() => router.push('/search')}
                    rightSlot={
                        <Touchable
                            onPress={() => router.push('/upload')}
                            className="border-l border-[#919EAB33] pl-3 ml-1"
                        >
                            <icons.uploadActive width={22} height={22} />
                        </Touchable>
                    }
                />
            </Animated.View>
        </>
    );
};
