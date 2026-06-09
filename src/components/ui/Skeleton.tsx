import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, View, ViewStyle, useWindowDimensions } from 'react-native';

interface SkeletonProps {
    width?: number | string;
    height?: number | string;
    borderRadius?: number;
    style?: ViewStyle;
}

// Shared animation value so all skeletons shimmer in sync
const sharedTranslate = new Animated.Value(0);
let animationStarted = false;

const startSharedAnimation = (screenWidth: number) => {
    if (animationStarted) return;
    animationStarted = true;
    sharedTranslate.setValue(-screenWidth);
    Animated.loop(
        Animated.timing(sharedTranslate, {
            toValue: screenWidth,
            duration: 1100,
            useNativeDriver: true,
        })
    ).start();
};

export const Skeleton: React.FC<SkeletonProps> = ({ width, height, borderRadius = 4, style }) => {
    const { width: screenWidth } = useWindowDimensions();

    useEffect(() => {
        startSharedAnimation(screenWidth);
    }, [screenWidth]);

    return (
        <View
            style={[
                {
                    width: width as any,
                    height: height as any,
                    borderRadius,
                    backgroundColor: '#E8EAED',
                    overflow: 'hidden',
                },
                style,
            ]}
        >
            <Animated.View
                style={{
                    flex: 1,
                    transform: [{ translateX: sharedTranslate }],
                }}
            >
                <LinearGradient
                    colors={['transparent', 'rgba(255,255,255,0.55)', 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ flex: 1, width: screenWidth }}
                />
            </Animated.View>
        </View>
    );
};
