import { ANIMATIONS } from "@/src/constants/images";
import { DotLottie, type Dotlottie } from "@lottiefiles/dotlottie-react-native";
import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { Dimensions, View } from "react-native";

const { width: SCREEN_W } = Dimensions.get("screen");
const SIZE = SCREEN_W;

export const CartConfetti = forwardRef<Dotlottie | null, {}>((_, ref) => {
  const animationRef = useRef<Dotlottie | null>(null);

  useImperativeHandle<Dotlottie | null, Dotlottie | null>(
    ref,
    () => animationRef.current,
    [],
  );

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999,
        elevation: 20,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <DotLottie
        ref={animationRef}
        source={ANIMATIONS.confetti}
        autoplay={false}
        loop={false}
        style={{ width: SIZE, height: SIZE, opacity: 0.9 }}
      />
    </View>
  );
});

CartConfetti.displayName = "CartConfetti";
