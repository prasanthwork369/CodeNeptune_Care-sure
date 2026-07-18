import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, View, ViewStyle, useWindowDimensions } from 'react-native';

interface SkeletonProps {
    width?: number | string;
    height?: number | string;
    borderRadius?: number;
    style?: ViewStyle;
}

// Shared animation value so all active skeletons shimmer in perfect sync.
const sharedTranslate = new Animated.Value(0);

// Ref-counter: start the loop when the first Skeleton mounts, stop when the last unmounts.
let mountedCount = 0;
let loopAnimation: Animated.CompositeAnimation | null = null;

const startSharedAnimation = (screenWidth: number) => {
    if (mountedCount !== 1) return; // already running; do not create duplicate
    sharedTranslate.setValue(-screenWidth);
    loopAnimation = Animated.loop(
        Animated.timing(sharedTranslate, {
            toValue: screenWidth,
            duration: 1100,
            useNativeDriver: true,
        })
    );
    loopAnimation.start();
};

const stopSharedAnimation = () => {
    if (mountedCount !== 0) return; // other skeletons still visible
    loopAnimation?.stop();
    loopAnimation = null;
};

export const Skeleton: React.FC<SkeletonProps> = ({ width, height, borderRadius = 4, style }) => {
    const { width: screenWidth } = useWindowDimensions();
    const screenWidthRef = useRef(screenWidth);
    screenWidthRef.current = screenWidth;

    useEffect(() => {
        mountedCount += 1;
        startSharedAnimation(screenWidthRef.current);

        return () => {
            mountedCount -= 1;
            stopSharedAnimation();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
