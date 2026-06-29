import { ANIMATIONS } from "@/src/constants/images";
import { exactScale } from "@/src/utils/exactScale";
import { DotLottie } from "@lottiefiles/dotlottie-react-native";
import React from "react";
import { View } from "react-native";

const SIZE = exactScale(390);

interface CartConfettiProps {
  /** Increment this number each time you want to play the animation.
   *  The component will remount from scratch with autoplay=true,
   *  which is the only reliable cross-platform way to replay a
   *  loop=false DotLottie animation after it has already finished. */
  trigger: number;
}

export const CartConfetti: React.FC<CartConfettiProps> = ({ trigger }) => {
  // When trigger is 0 (initial mount, nothing happened yet) render nothing
  // so we don't flash an idle animation frame on screen.
  if (trigger === 0) return null;

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
      {/* key forces a full remount every time trigger changes,
          giving us a brand-new native player that starts from frame 0 */}
      <DotLottie
        key={trigger}
        source={ANIMATIONS.confetti}
        autoplay
        loop={false}
        style={{ width: SIZE, height: SIZE, opacity: 0.9 }}
      />
    </View>
  );
};

CartConfetti.displayName = "CartConfetti";
