import { icons } from '@/src/constants/icons';
import { Touchable } from '@/src/components/ui/Touchable';
import React, { useEffect } from 'react';
import {
    Modal,
    Pressable,
    ScrollView,
    Text,
    View,
    useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
    Easing,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { TrackingStep } from '@/src/types/order';

// ─── Config ────────────────────────────────────────────────────────────────────

const SHEET_SPRING = { damping: 26, stiffness: 280, mass: 0.9 };
const EASE_OUT     = Easing.out(Easing.cubic);
// Steps start after the sheet has settled (~380 ms)
const STEP_BASE_DELAY = 380;
const STEP_INTERVAL   = 110;

// ─── Single step row ───────────────────────────────────────────────────────────

interface StepRowProps {
    step: TrackingStep;
    index: number;
    isLast: boolean;
    triggered: boolean;
}

function ModalStepRow({ step, index, isLast, triggered }: StepRowProps) {
    const opacity    = useSharedValue(0);
    const translateY = useSharedValue(10);

    useEffect(() => {
        opacity.value    = 0;
        translateY.value = 10;
        if (!triggered) return;
        const d = STEP_BASE_DELAY + index * STEP_INTERVAL;
        opacity.value    = withDelay(d, withTiming(1, { duration: 260, easing: EASE_OUT }));
        translateY.value = withDelay(d, withTiming(0, { duration: 260, easing: EASE_OUT }));
    }, [triggered]);

    const rowStyle = useAnimatedStyle(() => ({
        opacity:   opacity.value,
        transform: [{ translateY: translateY.value }],
    }));

    const lineColor = step.completed && !step.isActive ? '#16A34A' : '#E5E7EB';
    const textColor = step.cancelled ? '#DC2626' : step.completed || step.isActive ? '#1A1C1E' : '#9CA3AF';

    const renderDot = () => {
        if (step.cancelled) {
            return (
                <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: '#DC2626', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
                    <icons.cancel_white width={10} height={10} />
                </View>
            );
        }
        if (step.isActive) {
            return (
                <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#16A34A', borderWidth: 3, borderColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' }} />
                </View>
            );
        }
        if (step.completed) {
            return (
                <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: '#16A34A', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
                    <Text style={{ color: '#fff', fontSize: 9, fontFamily: 'Inter-Bold', lineHeight: 11 }}>✓</Text>
                </View>
            );
        }
        return (
            <View style={{ width: 16, height: 16, borderRadius: 8, borderWidth: 1.5, borderColor: '#D1D5DB', backgroundColor: '#fff', marginTop: 3 }} />
        );
    };

    return (
        <Animated.View style={[{ flexDirection: 'row' }, rowStyle]}>
            <View style={{ width: 26, alignItems: 'center', alignSelf: 'stretch' }}>
                {renderDot()}
                {!isLast && (
                    <View style={{ width: 2, flex: 1, backgroundColor: lineColor }} />
                )}
            </View>

            <View style={{ flex: 1, paddingLeft: 12, paddingBottom: isLast ? 4 : 10 }}>
                <Text style={{ fontSize: 14, fontFamily: 'Inter-SemiBold', color: textColor }}>
                    {step.title}
                </Text>
                {(step.completed || step.cancelled) && !!step.time && (
                    <Text style={{ fontSize: 12, fontFamily: 'Inter', color: '#6A6A6A', marginTop: 3 }}>
                        {step.time}
                    </Text>
                )}
            </View>
        </Animated.View>
    );
}

// ─── Modal ─────────────────────────────────────────────────────────────────────

interface Props {
    visible: boolean;
    onClose: () => void;
    steps: TrackingStep[];
}

export function OrderTrackingModal({ visible, onClose, steps }: Props) {
    const insets                   = useSafeAreaInsets();
    const { height: screenHeight } = useWindowDimensions();

    const sheetY         = useSharedValue(screenHeight);
    const overlayOpacity = useSharedValue(0);
    const panY           = useSharedValue(0);

    useEffect(() => {
        if (visible) {
            overlayOpacity.value = withTiming(1, { duration: 260, easing: EASE_OUT });
            sheetY.value         = withSpring(0, SHEET_SPRING);
        } else {
            overlayOpacity.value = withTiming(0, { duration: 220, easing: EASE_OUT });
            sheetY.value         = withTiming(screenHeight, { duration: 300, easing: EASE_OUT });
        }
    }, [visible]);

    const overlayStyle = useAnimatedStyle(() => ({
        opacity: overlayOpacity.value,
    }));
    const sheetStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: sheetY.value + panY.value }],
    }));

    const panGesture = Gesture.Pan()
        .onUpdate((e) => {
            panY.value = Math.max(0, e.translationY);
        })
        .onEnd((e) => {
            if (e.translationY > 100 || e.velocityY > 800) {
                runOnJS(handleClose)();
            } else {
                panY.value = withSpring(0, { damping: 22, stiffness: 300 });
            }
        });

    const handleClose = () => {
        overlayOpacity.value = withTiming(0,            { duration: 220, easing: EASE_OUT });
        sheetY.value         = withTiming(screenHeight, { duration: 300, easing: EASE_OUT }, (done) => {
            if (done) runOnJS(onClose)();
        });
    };

    return (
        <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
            {/* Dimmed backdrop */}
            <Animated.View
                style={[
                    {
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.55)',
                    },
                    overlayStyle,
                ]}
            >
                <Pressable style={{ flex: 1 }} onPress={handleClose} />
            </Animated.View>

            {/* Sheet + close button */}
            <GestureDetector gesture={panGesture}>
            <Animated.View
                style={[
                    {
                        position: 'absolute',
                        bottom: 0, left: 0, right: 0,
                        alignItems: 'center',
                    },
                    sheetStyle,
                ]}
            >
                <Touchable
                    onPress={handleClose}
                    activeOpacity={0.8}
                    style={{
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        backgroundColor: '#555555',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 10,
                    }}
                >
                    <icons.close_icon width={14} height={14} fill="#FFFFFF" />
                </Touchable>

                <View
                    style={{
                        backgroundColor: '#fff',
                        borderTopLeftRadius: 24,
                        borderTopRightRadius: 24,
                        width: '100%',
                        paddingHorizontal: 20,
                        paddingTop: 20,
                        paddingBottom: Math.max(insets.bottom, 16) + 16,
                    }}
                >
                    <Text
                        style={{
                            fontSize: 18,
                            fontFamily: 'Inter_700Bold',
                            color: '#1A1C1E',
                            marginBottom: 20,
                        }}
                    >
                        Order Tracking
                    </Text>

                    <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 480 }}>
                        {steps.map((step, index) => (
                            <ModalStepRow
                                key={index}
                                step={step}
                                index={index}
                                isLast={index === steps.length - 1}
                                triggered={visible}
                            />
                        ))}
                    </ScrollView>
                </View>
            </Animated.View>
            </GestureDetector>
        </Modal>
    );
}
