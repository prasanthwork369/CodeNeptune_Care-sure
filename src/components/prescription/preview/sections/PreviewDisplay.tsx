import { PdfViewer } from "@/src/components/ui/PdfViewer";
import { icons } from "@/src/constants/icons";
import { PreviewDisplayProps } from "@/src/types/prescription";
import { Touchable } from "@/src/components/ui/Touchable";
import React, { useEffect } from "react";
import { Alert, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
} from "react-native-reanimated";

const isPdf = (uri: string, type?: string) =>
    type === "application/pdf" || uri.toLowerCase().endsWith(".pdf");

export const PreviewDisplay: React.FC<PreviewDisplayProps> = ({
    activeItem,
    screenWidth,
    previewHeight,
    onLayout,
    onPrev,
    showPrev,
    onNext,
    showNext,
}) => {
    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const savedTranslateX = useSharedValue(0);
    const savedTranslateY = useSharedValue(0);

    // Reset zoom when active item changes
    useEffect(() => {
        scale.value = 1;
        translateX.value = 0;
        translateY.value = 0;
        savedScale.value = 1;
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
    }, [activeItem?.localUri]);

    const resetZoom = () => {
        'worklet';
        scale.value = 1;
        translateX.value = 0;
        translateY.value = 0;
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
                const maxX = ((screenWidth - 48) * (savedScale.value - 1)) / 2;
                const maxY = (previewHeight * (savedScale.value - 1)) / 2;
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
                scale.value = 2.5;
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

    return (
        <View style={{ flex: 1, position: "relative" }}>
            <View
                className="rounded-md overflow-hidden"
                style={{
                    flex: 1,
                    shadowColor: "#919EAB33",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.5,
                    shadowRadius: 1,
                    elevation: 0,
                    borderWidth: 1,
                    borderColor: "#919EAB33",
                    backgroundColor: "#F9FAFB",
                }}
                onLayout={(e) => onLayout(e.nativeEvent.layout.height)}
            >
                {activeItem && isPdf(activeItem.localUri, activeItem.type) ? (
                    <PdfViewer
                        uri={activeItem.localUri}
                        style={{
                            width: screenWidth - 48,
                            height: previewHeight,
                            backgroundColor: "#F9FAFB",
                        }}
                        onError={() => Alert.alert("Error", "Could not load PDF.")}
                    />
                ) : (activeItem && previewHeight > 0) ? (
                    <GestureDetector gesture={composed}>
                        <Animated.View
                            style={{
                                width: screenWidth - 48,
                                height: previewHeight,
                                overflow: "hidden",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Animated.Image
                                source={{ uri: activeItem.localUri }}
                                style={[
                                    {
                                        width: screenWidth - 48,
                                        height: previewHeight,
                                    },
                                    animatedStyle,
                                ]}
                                resizeMode="contain"
                            />
                        </Animated.View>
                    </GestureDetector>
                ) : null}
            </View>

            {showPrev && (
                <Touchable
                    onPress={onPrev}
                    style={{
                        position: "absolute",
                        left: -20,
                        top: "50%",
                        marginTop: -24,
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        backgroundColor: "#fff",
                        borderWidth: 1,
                        borderColor: "#919EAB33",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 20,
                        elevation: 8,
                        shadowColor: "#919EAB33",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.1,
                        shadowRadius: 20,
                    }}
                >
                    <icons.arrow_back_ios width={16} height={16} fill="#222222" />
                </Touchable>
            )}

            {showNext && (
                <Touchable
                    onPress={onNext}
                    style={{
                        position: "absolute",
                        right: -20,
                        top: "50%",
                        marginTop: -24,
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        backgroundColor: "#fff",
                        borderWidth: 1,
                        borderColor: "#919EAB33",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 20,
                        elevation: 8,
                        shadowColor: "#919EAB33",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.1,
                        shadowRadius: 20,
                    }}
                >
                    <icons.arrow_forward_ios width={16} height={16} fill="#222222" />
                </Touchable>
            )}
        </View>
    );
};
