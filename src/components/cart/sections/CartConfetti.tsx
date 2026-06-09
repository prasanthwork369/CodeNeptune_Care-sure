import React, { forwardRef } from 'react';
import { View, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';
import { ANIMATIONS } from '@/src/constants/images';

const { width: SCREEN_W } = Dimensions.get('screen');
const SIZE = SCREEN_W;

export const CartConfetti = forwardRef<LottieView>((_, ref) => {
    return (
        <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99, alignItems: 'center', justifyContent: 'center' }}>
            <LottieView
                ref={ref}
                source={ANIMATIONS.confetti}
                autoPlay={false}
                loop={false}
                resizeMode="contain"
                style={{ width: SIZE, height: SIZE, opacity: 0.9 }}
            />
        </View>
    );
});
