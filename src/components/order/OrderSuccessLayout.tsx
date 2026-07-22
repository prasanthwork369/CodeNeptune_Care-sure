import { Touchable } from '@/src/components/ui/Touchable';
import { icons } from '@/src/constants/icons';
import { ANIMATIONS } from '@/src/constants/images';
import { useNav } from '@/src/hooks/useNav';
import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { DotLottie } from '@lottiefiles/dotlottie-react-native';
import React, { useCallback, useEffect, useMemo } from 'react';
import { ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    Easing,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSequence,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { exactScale, moderateScale } from '@/src/utils/exactScale';
import { formatOrderId } from '@/src/utils/order';

// ── Confetti ──────────────────────────────────────────────────────────────────

const CONFETTI_COLORS = [
    '#0F7635', '#36B37E', '#8BC34A',
    '#FFD700', '#FFA726', '#FF7043',
    '#4FC3F7', '#AB47BC', '#EC407A',
];

interface PieceConfig {
    id: number;
    x: number;
    color: string;
    w: number;
    h: number;
    delay: number;
    duration: number;
    endRotation: number;
}

const ConfettiPiece: React.FC<PieceConfig & { screenH: number }> = ({
    x, color, w, h, delay, duration, endRotation, screenH,
}) => {
    const ty     = useSharedValue(-30);
    const rotate = useSharedValue(0);
    const opacity = useSharedValue(0);

    useEffect(() => {
        ty.value = withDelay(delay, withTiming(screenH + 80, {
            duration,
            easing: Easing.in(Easing.quad),
        }));
        rotate.value = withDelay(delay, withTiming(endRotation, { duration }));
        opacity.value = withDelay(delay, withSequence(
            withTiming(1, { duration: 80 }),
            withTiming(1, { duration: Math.max(0, duration - 80 - duration * 0.3) }),
            withTiming(0, { duration: duration * 0.3 }),
        ));
    }, []);

    const style = useAnimatedStyle(() => ({
        transform: [{ translateY: ty.value }, { rotate: `${rotate.value}deg` }],
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[{
                position: 'absolute',
                top: 0,
                left: x,
                width: w,
                height: h,
                backgroundColor: color,
                borderRadius: 2,
            }, style]}
        />
    );
};

// ── Main ──────────────────────────────────────────────────────────────────────

export const OrderSuccessLayout: React.FC = () => {
    const router = useNav();
    const adjustedBottom = useAdjustedBottomInset();
    const { width, height } = useWindowDimensions();
    const { orderId = '', total = '0' } = useLocalSearchParams<{ orderId: string; total: string }>();

    // Entry animation
    const cardScale   = useSharedValue(0.88);
    const cardOpacity = useSharedValue(0);
    const btnTranslate = useSharedValue(40);
    const btnOpacity   = useSharedValue(0);

    // Drag to close
    const panY = useSharedValue(0);

    useEffect(() => {
        cardScale.value   = withTiming(1, { duration: 350, easing: Easing.out(Easing.quad) });
        cardOpacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.quad) });
        btnTranslate.value = withDelay(250, withTiming(0, { duration: 350, easing: Easing.out(Easing.quad) }));
        btnOpacity.value   = withDelay(250, withTiming(1, { duration: 300, easing: Easing.out(Easing.quad) }));
    }, []);

    const cardStyle = useAnimatedStyle(() => ({
        transform: [{ scale: cardScale.value }, { translateY: panY.value }],
        opacity: cardOpacity.value,
    }));
    const btnStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: btnTranslate.value }],
        opacity: btnOpacity.value,
    }));

    // Confetti pieces — generated once
    const pieces = useMemo<PieceConfig[]>(() =>
        Array.from({ length: 32 }, (_, i) => ({
            id: i,
            x: Math.random() * (width - 14),
            color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            w: 6 + Math.random() * 7,
            h: 3 + Math.random() * 5,
            delay: Math.random() * 550,
            duration: 1700 + Math.random() * 900,
            endRotation: Math.random() * 720 - 360,
        })),
    []);

    const dismiss = useCallback(() => { router.back(); }, []);

    const panGesture = Gesture.Pan()
        .onUpdate((e) => {
            panY.value = Math.max(0, e.translationY);
        })
        .onEnd((e) => {
            if (e.translationY > 120 || e.velocityY > 900) {
                panY.value = withTiming(height, { duration: 240, easing: Easing.in(Easing.quad) });
                runOnJS(dismiss)();
            } else {
                panY.value = withSpring(0, { damping: 22, stiffness: 300 });
            }
        });

    return (
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' }}>
            <StatusBar style="light" />

            <Animated.View style={[cardStyle, {
                backgroundColor: '#fff',
                borderTopLeftRadius: exactScale(32),
                borderTopRightRadius: exactScale(32),
                overflow: 'hidden',
                maxHeight: Math.max(0, height - exactScale(16)),
            }]}>
                {/* Confetti — clipped inside sheet by overflow:hidden */}
                <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 }}>
                    {pieces.map(p => (
                        <ConfettiPiece key={p.id} {...p} screenH={700} />
                    ))}
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                    contentContainerStyle={{
                        alignItems: 'center',
                        paddingTop: exactScale(28),
                        paddingHorizontal: exactScale(24),
                        paddingBottom: adjustedBottom + exactScale(24),
                    }}
                >
                    {/* Keep dismissal on the handle so content scrolling stays reliable. */}
                    <GestureDetector gesture={panGesture}>
                        <View
                            hitSlop={16}
                            style={{
                                width: exactScale(40),
                                height: exactScale(4),
                                borderRadius: exactScale(2),
                                backgroundColor: '#E5E7EB',
                                marginBottom: exactScale(24),
                            }}
                        />
                    </GestureDetector>

                    <DotLottie
                        source={ANIMATIONS.orderPlaced}
                        autoplay
                        loop={false}
                        style={{ width: exactScale(160), height: exactScale(160) }}
                    />

                    <Text style={{ fontSize: moderateScale(22), fontWeight: '800', color: '#0F1724', marginTop: exactScale(8), textAlign: 'center' }}>
                        Order Placed! 🎉
                    </Text>
                    <Text style={{ fontSize: moderateScale(14), color: '#6A6A6A', marginTop: exactScale(6), textAlign: 'center', lineHeight: moderateScale(20) }}>
                        {"Your medicines are on their way.\nWe'll keep you updated."}
                    </Text>

                    <View style={{ width: '100%', marginTop: exactScale(24), backgroundColor: '#F8FFF9', borderRadius: exactScale(16), borderWidth: 1, borderColor: '#0F763522', padding: exactScale(16), gap: exactScale(12) }}>
                        {orderId ? (
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={{ fontSize: moderateScale(13), fontWeight: '500', color: '#6A6A6A' }}>Order ID</Text>
                                <Text style={{ fontSize: moderateScale(13), fontWeight: '700', color: '#1A1C1E' }}>{formatOrderId(orderId)}</Text>
                            </View>
                        ) : null}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={{ fontSize: moderateScale(13), fontWeight: '500', color: '#6A6A6A' }}>Amount Paid</Text>
                            <Text style={{ fontSize: moderateScale(13), fontWeight: '700', color: '#0F7635' }}>₹{Number(total).toFixed(2)}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={{ fontSize: moderateScale(13), fontWeight: '500', color: '#6A6A6A' }}>Delivery</Text>
                            <Text style={{ fontSize: moderateScale(13), fontWeight: '700', color: '#1A1C1E' }}>2–4 Business Days</Text>
                        </View>
                    </View>

                    <Animated.View style={[btnStyle, { width: '100%', marginTop: exactScale(24), gap: exactScale(12) }]}>
                        <Touchable
                            activeOpacity={0.88}
                            onPress={() => router.replace('/profile/orders' as any)}
                            style={{ backgroundColor: '#0F7635', borderRadius: exactScale(14), paddingVertical: exactScale(16), alignItems: 'center' }}
                        >
                            <Text style={{ fontSize: moderateScale(15), fontWeight: '700', color: '#fff' }}>Track My Order</Text>
                        </Touchable>
                        <Touchable
                            activeOpacity={0.5}
                            onPress={() => router.replace('/(tabs)')}
                            style={{ borderRadius: exactScale(14), paddingVertical: exactScale(14), alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: exactScale(6), borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' }}
                        >
                            <Text style={{ fontSize: moderateScale(14), fontWeight: '600', color: '#374151' }}>Continue Shopping</Text>
                            <icons.arrow_forward_ios width={exactScale(12)} height={exactScale(12)} fill="#374151" />
                        </Touchable>
                    </Animated.View>
                </ScrollView>
            </Animated.View>
        </View>
    );
};
