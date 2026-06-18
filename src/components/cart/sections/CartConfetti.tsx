import React, { forwardRef } from 'react';
import { View, Dimensions } from 'react-native';
import { DotLottie, type Dotlottie } from '@lottiefiles/dotlottie-react-native';
import { ANIMATIONS } from '@/src/constants/images';

const { width: SCREEN_W } = Dimensions.get('screen');
const SIZE = SCREEN_W;

export const CartConfetti = forwardRef<Dotlottie>((_, ref) => {
    return (
        <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99, alignItems: 'center', justifyContent: 'center' }}>
            <DotLottie
                ref={ref}
                source={ANIMATIONS.confetti}
                autoplay={false}
                loop={false}
                style={{ width: SIZE, height: SIZE, opacity: 0.9 }}
            />
        </View>
    );
});

CartConfetti.displayName = 'CartConfetti';
