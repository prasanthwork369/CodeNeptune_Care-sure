import { tabs } from '@/src/constants/data';
import { useTabBarStore } from '@/src/store/useTabBarStore';
import { PILL_HEIGHT, FAB_WIDTH, BAR_HEIGHT, ICON_SIZE, UPLOAD_ICON, styles as tabStyles } from './LiquidTabBar.styles';
import { HOME_IMAGES } from '@/src/constants/images';
import { useUIStore } from '@/src/store/uiStore';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useNav } from '@/src/hooks/useNav';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Image, LayoutChangeEvent, Pressable, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    Easing,
    Extrapolation,
    interpolate,
    interpolateColor,
    runOnJS,
    SharedValue,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ACTIVE_BG           = '#ECFDF5';
const ACTIVE_ICON_COLOR   = '#0F7635';
const INACTIVE_ICON_COLOR = '#9CA3AF';

// Snappy spring — feels instant like Blinkit
const SNAP_SPRING   = { damping: 28, stiffness: 420, mass: 0.5 } as const;
// Slightly trailing spring for the liquid stretch effect
const TRAIL_SPRING  = { damping: 22, stiffness: 320, mass: 0.6 } as const;
// Material-style easing for tab bar show/hide
const SLIDE_EASING  = Easing.bezier(0.4, 0, 0.2, 1);
// Snappier, tighter spring for the upload button's expand/collapse width —
// matches SLIDE_SPRING's feel more closely so both stay in sync.
const WIDTH_SPRING = { damping: 22, stiffness: 260, mass: 0.6 } as const;
// Gentle spring for the upload button's icon/text slide transitions
const SLIDE_SPRING = { damping: 18, stiffness: 130, mass: 0.6 } as const;
// Smooth ease for the upload button's text fade
const TRANSLATE_EASING = Easing.out(Easing.cubic);

const ICON_OFF_LEFT     = -100;
const TEXT_OFF_RIGHT    = 150;
const AUTO_EXPAND_DELAY = 500;
const HOLD_EXPANDED_MS  = 2200;
const HOLD_COLLAPSED_MS = 1400;

const AnimatedText = Animated.createAnimatedComponent(Text);

// ─── Animated Upload Button ───────────────────────────────────────────────────

const AnimatedUploadButton = React.memo(({ onPress }: { onPress: () => void }) => {
    const { isUploadButtonCollapsed } = useUIStore();
    const iconTranslate = useSharedValue(0);
    const textTranslate = useSharedValue(TEXT_OFF_RIGHT);
    const buttonWidth   = useSharedValue(isUploadButtonCollapsed ? PILL_HEIGHT : FAB_WIDTH);
    const textOpacity   = useSharedValue(isUploadButtonCollapsed ? 0 : 1);

    const animateTo = useCallback((expand: boolean) => {
        if (expand) {
            iconTranslate.value = withSpring(ICON_OFF_LEFT, SLIDE_SPRING);
            textTranslate.value = withSpring(0,             SLIDE_SPRING);
        } else {
            textTranslate.value = withSpring(TEXT_OFF_RIGHT, SLIDE_SPRING);
            iconTranslate.value = withSpring(0,              SLIDE_SPRING);
        }
    }, []);

    // Single effect drives width, text opacity, and icon/text position
    // together whenever the collapsed state flips, so they stay in lockstep
    // instead of two independent effects animating related properties with
    // different spring/timing configs (which could fall out of sync).
    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout>;

        buttonWidth.value = withSpring(isUploadButtonCollapsed ? PILL_HEIGHT : FAB_WIDTH, WIDTH_SPRING);
        textOpacity.value = withTiming(isUploadButtonCollapsed ? 0 : 1, { duration: 220, easing: TRANSLATE_EASING });

        const tick = (expand: boolean) => {
            if (isUploadButtonCollapsed) return;
            animateTo(expand);
            timeout = setTimeout(() => tick(!expand), expand ? HOLD_EXPANDED_MS : HOLD_COLLAPSED_MS);
        };

        if (!isUploadButtonCollapsed) {
            timeout = setTimeout(() => tick(true), AUTO_EXPAND_DELAY);
        } else {
            iconTranslate.value = withSpring(0,              SLIDE_SPRING);
            textTranslate.value = withSpring(TEXT_OFF_RIGHT, SLIDE_SPRING);
        }
        return () => clearTimeout(timeout);
    }, [isUploadButtonCollapsed]);

    const animatedButtonStyle = useAnimatedStyle(() => ({
        width: buttonWidth.value,
        height: PILL_HEIGHT,
        borderTopLeftRadius: PILL_HEIGHT,
        borderBottomLeftRadius: PILL_HEIGHT,
        overflow: 'hidden',
        backgroundColor: 'transparent',
    }));

    return (
        <Pressable onPress={onPress} style={{ height: PILL_HEIGHT }}>
            <Animated.View style={animatedButtonStyle}>
                <LinearGradient
                    colors={['#CB391C', '#F88004']}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={{ width: '100%', height: '100%', borderTopLeftRadius: PILL_HEIGHT, borderBottomLeftRadius: PILL_HEIGHT, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
                >
                    <Animated.View style={[{ position: 'absolute' }, useAnimatedStyle(() => ({ transform: [{ translateX: iconTranslate.value }] }))]}>
                        <Image source={HOME_IMAGES.upload_png} style={{ width: UPLOAD_ICON, height: UPLOAD_ICON }} resizeMode="contain" />
                    </Animated.View>
                    <Animated.View style={[{ position: 'absolute' }, useAnimatedStyle(() => ({ transform: [{ translateX: textTranslate.value }], opacity: textOpacity.value }))]}>
                        <Text style={tabStyles.uploadText}>Upload{'\n'}Prescription</Text>
                    </Animated.View>
                </LinearGradient>
            </Animated.View>
        </Pressable>
    );
});
AnimatedUploadButton.displayName = 'AnimatedUploadButton';

// ─── Tab Item ─────────────────────────────────────────────────────────────────

interface TabItemProps {
    icon: React.ComponentType<{ color?: string; width?: number; height?: number }>;
    activeIcon?: React.ComponentType<{ color?: string; width?: number; height?: number }>;
    index: number;
    label: string;
    followerX: SharedValue<number>;
    pillOpacity: SharedValue<number>;
}

const TabItem = React.memo(({ icon: Icon, activeIcon: ActiveIcon, index, label, followerX, pillOpacity }: TabItemProps) => {
    const AnimatedIcon       = useMemo(() => Animated.createAnimatedComponent(Icon), [Icon]);
    const AnimatedActiveIcon = useMemo(() => ActiveIcon ? Animated.createAnimatedComponent(ActiveIcon) : null, [ActiveIcon]);

    const activeIconStyle = useAnimatedStyle(() => {
        'worklet';
        const dist = Math.abs(followerX.value - index);
        return { opacity: dist < 0.3 ? interpolate(dist, [0, 0.2], [1, 0], Extrapolation.CLAMP) * pillOpacity.value : 0 };
    });

    const normalIconStyle = useAnimatedStyle(() => {
        'worklet';
        const dist = Math.abs(followerX.value - index);
        const a    = dist < 0.3 ? interpolate(dist, [0, 0.2], [1, 0], Extrapolation.CLAMP) * pillOpacity.value : 0;
        return { opacity: 1 - a, position: ActiveIcon ? 'absolute' : 'relative' };
    });

    const zoomStyle = useAnimatedStyle(() => {
        'worklet';
        const dist  = Math.abs(followerX.value - index);
        const scale = interpolate(dist, [0, 0.4], [1.1, 1], Extrapolation.CLAMP);
        return { transform: [{ scale: 1 + (scale - 1) * pillOpacity.value }] };
    });

    const animatedTextStyle = useAnimatedStyle(() => {
        'worklet';
        const dist = Math.abs(followerX.value - index);
        const w    = interpolate(dist, [0, 0.2], [1, 0], Extrapolation.CLAMP) * pillOpacity.value;
        return {
            color:      interpolateColor(w, [0, 1], [INACTIVE_ICON_COLOR, ACTIVE_ICON_COLOR]),
            fontSize:   tabStyles.tabLabel.fontSize,
            marginTop:  2,
            textAlign:  'center',
            width:      '100%',
        };
    });

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 }} className="py-2 h-full z-10">
            <Animated.View style={[{ alignItems: 'center', justifyContent: 'center', height: ICON_SIZE, width: ICON_SIZE }, zoomStyle]}>
                {AnimatedActiveIcon && (
                    <Animated.View style={activeIconStyle}>
                        <AnimatedActiveIcon width={ICON_SIZE} height={ICON_SIZE} color={ACTIVE_ICON_COLOR} />
                    </Animated.View>
                )}
                <Animated.View style={normalIconStyle}>
                    <AnimatedIcon width={ICON_SIZE} height={ICON_SIZE} color={INACTIVE_ICON_COLOR} />
                </Animated.View>
            </Animated.View>
            <AnimatedText style={animatedTextStyle} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
                {label}
            </AnimatedText>
        </View>
    );
});
TabItem.displayName = 'TabItem';

// ─── Liquid Tab Bar ───────────────────────────────────────────────────────────

const LiquidTabBar = ({ state, navigation }: BottomTabBarProps) => {
    const insets             = useSafeAreaInsets();
    const router             = useNav();
    const { isTabBarVisible }  = useUIStore();
    const { setTabBarHeight }  = useTabBarStore();
    const [barWidth, setBarWidth] = useState(0);

    const pillRoutes = useMemo(() =>
        state.routes.filter(r => ['index', 'categories', 'profile'].includes(r.name)),
        [state.routes]);

    const activePillIndex = useMemo(() => {
        const activeRoute = state.routes[state.index];
        return pillRoutes.findIndex(r => r.name === activeRoute.name);
    }, [state.index, pillRoutes]);

    const lastValidIndex = useRef(activePillIndex === -1 ? 0 : activePillIndex);
    if (activePillIndex !== -1) lastValidIndex.current = activePillIndex;

    const tabWidthShared    = useSharedValue(0);
    const leaderX           = useSharedValue(lastValidIndex.current);
    const followerX         = useSharedValue(lastValidIndex.current);
    const pillOpacity       = useSharedValue(activePillIndex === -1 ? 0 : 1);
    const tabBarTranslateY  = useSharedValue(isTabBarVisible ? 0 : 120);

    useEffect(() => {
        tabBarTranslateY.value = withTiming(isTabBarVisible ? 0 : 120, { duration: 240, easing: SLIDE_EASING });
    }, [isTabBarVisible]);

    useEffect(() => {
        if (activePillIndex !== -1) {
            pillOpacity.value = withSpring(1, SNAP_SPRING);
            leaderX.value     = withSpring(activePillIndex, SNAP_SPRING);
            followerX.value   = withSpring(activePillIndex, TRAIL_SPRING);
        } else {
            pillOpacity.value = withTiming(0, { duration: 150 });
        }
    }, [activePillIndex]);

    const navigateToTab = useCallback((index: number) => {
        const route = pillRoutes[index];
        if (route) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate(route.name);
        }
    }, [pillRoutes, navigation]);

    const onLayout = useCallback((e: LayoutChangeEvent) => {
        const { width } = e.nativeEvent.layout;
        const tw = width / pillRoutes.length;
        setBarWidth(width);
        tabWidthShared.value = tw;
        if (barWidth === 0) {
            leaderX.value  = activePillIndex === -1 ? 0 : activePillIndex;
            followerX.value = activePillIndex === -1 ? 0 : activePillIndex;
        }
    }, [barWidth, pillRoutes.length, activePillIndex]);

    const panGesture = useMemo(() => Gesture.Pan()
        .activeOffsetX([-6, 6])
        .onUpdate((e) => {
            'worklet';
            const tw = tabWidthShared.value;
            if (tw <= 0) return;
            const clamped = Math.max(0, Math.min(pillRoutes.length - 1, e.x / tw));
            leaderX.value  = clamped;
            followerX.value = withSpring(clamped, TRAIL_SPRING);
        })
        .onEnd(() => {
            'worklet';
            const final = Math.min(pillRoutes.length - 1, Math.max(0, Math.round(leaderX.value)));
            leaderX.value   = withSpring(final, SNAP_SPRING);
            followerX.value = withSpring(final, TRAIL_SPRING);
            runOnJS(navigateToTab)(final);
        }),
        [pillRoutes.length, navigateToTab]);

    const tapGesture = useMemo(() => Gesture.Tap()
        .maxDistance(14)
        .onEnd((e) => {
            'worklet';
            const tw = tabWidthShared.value;
            if (tw <= 0) return;
            const final = Math.min(pillRoutes.length - 1, Math.max(0, Math.floor(e.x / tw)));
            leaderX.value   = withSpring(final, SNAP_SPRING);
            followerX.value = withSpring(final, TRAIL_SPRING);
            runOnJS(navigateToTab)(final);
        }),
        [pillRoutes.length, navigateToTab]);

    // Race: whichever gesture recognizes first wins — tap is instant, pan needs movement
    const gesture = useMemo(() => Gesture.Race(tapGesture, panGesture), [tapGesture, panGesture]);

    const animatedPillStyle = useAnimatedStyle(() => {
        'worklet';
        const tw      = tabWidthShared.value;
        const start   = Math.min(leaderX.value, followerX.value);
        const end     = Math.max(leaderX.value, followerX.value);
        const stretch = (end - start) * tw;
        return {
            transform: [
                { translateX: start * tw + 3 },
                { scaleY: interpolate(stretch, [0, tw], [1, 0.94], Extrapolation.CLAMP) },
            ],
            width:           tw + stretch - 6,
            backgroundColor: ACTIVE_BG,
            opacity:         pillOpacity.value,
        };
    });

    const animatedTabBarContainerStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: tabBarTranslateY.value }],
    }));

    const tabItems = useMemo(() =>
        pillRoutes.map((route, index) => ({
            route,
            index,
            tab: tabs.find(t => t.name === route.name),
        })).filter(item => item.tab != null),
        [pillRoutes]);

    const handleUploadPress = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push('/upload');
    }, [router]);
    const handleLayout      = useCallback((e: any) => setTabBarHeight(e.nativeEvent.layout.height + 16 + 12), [setTabBarHeight]);

    return (
        <View
            className="absolute bottom-0 left-0 right-0 flex-row items-center pl-3 pr-0"
            style={{ height: BAR_HEIGHT + insets.bottom, paddingBottom: insets.bottom }}
            pointerEvents="box-none"
            onLayout={handleLayout}
        >
            <LinearGradient
                colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.9)', 'rgba(255,255,255,0.95)', '#FFFFFF']}
                locations={[0, 0.25, 0.6, 1]}
                pointerEvents="none"
                style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: insets.bottom + 15 }}
            />
            <Animated.View
                style={[{ flex: 1, height: PILL_HEIGHT }, animatedTabBarContainerStyle]}
                pointerEvents="box-none"
            >
                <GestureDetector gesture={gesture}>
                    <View
                        onLayout={onLayout}
                        style={{ height: PILL_HEIGHT, borderRadius: PILL_HEIGHT / 2, backgroundColor: '#fff', shadowColor: '#919EAB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.18, shadowRadius: 12, elevation: 4, overflow: 'hidden' }}
                        className="flex-1 flex-row items-center mr-2.5"
                    >
                        {barWidth > 0 && (
                            <View
                                pointerEvents="none"
                                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: PILL_HEIGHT / 2, overflow: 'hidden' }}
                            >
                                <Animated.View
                                    style={[animatedPillStyle, { position: 'absolute', height: PILL_HEIGHT - 14, borderRadius: (PILL_HEIGHT - 14) / 2, top: 7 }]}
                                />
                            </View>
                        )}
                        {tabItems.map(({ route, index, tab }) => (
                            <TabItem
                                key={route.key}
                                index={index}
                                icon={tab!.icon}
                                activeIcon={tab!.activeIcon}
                                label={tab!.title}
                                followerX={followerX}
                                pillOpacity={pillOpacity}
                            />
                        ))}
                    </View>
                </GestureDetector>
            </Animated.View>

            <AnimatedUploadButton onPress={handleUploadPress} />
        </View>
    );
};

export default LiquidTabBar;
