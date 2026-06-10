import { PdfViewer } from '@/src/components/ui/PdfViewer';
import { ScreenHeader } from '@/src/components/ui/ScreenHeader';
import { useNav } from '@/src/hooks/useNav';
import { useLocalSearchParams } from 'expo-router';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { Touchable } from '@/src/components/ui/Touchable';
import React, { useState } from 'react';
import { Image, LayoutChangeEvent, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const PrescriptionViewerLayout: React.FC = () => {
    const router = useNav();
    const insets = useSafeAreaInsets();
    const { width, height } = useWindowDimensions();
    const [containerHeight, setContainerHeight] = useState(0);
    const onContainerLayout = (e: LayoutChangeEvent) => setContainerHeight(e.nativeEvent.layout.height);

    const { imageUrls, doctorName, patientName, uploadedDate, toPay, source } = useLocalSearchParams<{
        prescriptionId: string;
        imageUrls: string;
        doctorName: string;
        patientName: string;
        uploadedDate: string;
        toPay?: string;
        source?: string;
    }>();

    const urls: string[] = imageUrls ? JSON.parse(imageUrls) : [];
    const currentUrl = urls[0] ?? '';
    const isPdf = currentUrl.toLowerCase().endsWith('.pdf');

    // Zoom shared values
    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const savedTranslateX = useSharedValue(0);
    const savedTranslateY = useSharedValue(0);

    const resetZoom = () => {
        'worklet';
        scale.value = withSpring(1, { damping: 20 });
        translateX.value = withSpring(0, { damping: 20 });
        translateY.value = withSpring(0, { damping: 20 });
        savedScale.value = 1;
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
    };

    const pinchGesture = Gesture.Pinch()
        .onUpdate((e) => {
            scale.value = Math.min(Math.max(savedScale.value * e.scale, 1), 6);
        })
        .onEnd(() => {
            if (scale.value <= 1) {
                resetZoom();
            } else {
                savedScale.value = scale.value;
            }
        });

    const panGesture = Gesture.Pan()
        .onUpdate((e) => {
            if (savedScale.value > 1) {
                const maxX = (width * (savedScale.value - 1)) / 2;
                const maxY = (containerHeight * (savedScale.value - 1)) / 2;
                translateX.value = Math.min(Math.max(savedTranslateX.value + e.translationX, -maxX), maxX);
                translateY.value = Math.min(Math.max(savedTranslateY.value + e.translationY, -maxY), maxY);
            }
        })
        .onEnd(() => {
            savedTranslateX.value = translateX.value;
            savedTranslateY.value = translateY.value;
        });

    const doubleTap = Gesture.Tap()
        .numberOfTaps(2)
        .maxDuration(250)
        .onEnd(() => {
            if (scale.value > 1) {
                resetZoom();
            } else {
                scale.value = withTiming(2.5, { duration: 250 });
                savedScale.value = 2.5;
            }
        });

    const composed = Gesture.Simultaneous(
        doubleTap,
        Gesture.Simultaneous(pinchGesture, panGesture),
    );

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: scale.value },
            { translateX: translateX.value },
            { translateY: translateY.value },
        ],
    }));

    const handleSelect = () => {
        const filesPayload = urls.map((u) => ({
            localUri: u,
            name: u.split('/').pop() ?? 'prescription',
            type: u.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg',
        }));
        router.push({
            pathname: '/(prescription)/preview',
            params: {
                files: JSON.stringify(filesPayload),
                toPay: toPay ?? '0',
                source: source === 'cart' ? 'cart' : 'existing',
            },
        });
    };

    return (
        <View className="flex-1 bg-[#F5F6FB]">
            <ScreenHeader title="Prescription" />

            <View className="flex-1" onLayout={onContainerLayout}>
                {containerHeight > 0 && (isPdf ? (
                    <PdfViewer
                        uri={currentUrl}
                        style={{ width, height: containerHeight, backgroundColor: '#F5F6FB' }}
                    />
                ) : (
                    <GestureDetector gesture={composed}>
                        <Animated.View
                            style={{ width, height: containerHeight, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
                        >
                            <Animated.Image
                                source={{ uri: currentUrl }}
                                style={[{ width, height: containerHeight }, animatedStyle]}
                                resizeMode="contain"
                            />
                        </Animated.View>
                    </GestureDetector>
                ))}
            </View>

            {source !== 'view_only' && (
                <View
                    className="flex-row gap-3 px-5 pt-3 bg-white border-t border-[#EEEFF1]"
                    style={{ paddingBottom: insets.bottom + 12 }}
                >
                    <Touchable
                        onPress={handleSelect}
                        activeOpacity={0.85}
                        className="flex-1 items-center justify-center py-3.5 rounded-xl bg-brand-primary"
                    >
                        <Text className="text-[14px] font-inter-semibold text-white">Select</Text>
                    </Touchable>
                </View>
            )}
        </View>
    );
};
