import React, { useEffect } from "react";
import Animated, {
  useSharedValue,
  withDelay,
  withTiming,
  Easing,
  interpolate,
  Extrapolation,
  useAnimatedStyle,
} from "react-native-reanimated";

export const PARTICLE_CONFIGS = [
  { dx: -22, dy: -10, size: 10, delay: 0 },
  { dx: -12, dy: -22, size: 13, delay: 40 },
  { dx: 10, dy: -24, size: 9, delay: 20 },
  { dx: 22, dy: -12, size: 14, delay: 60 },
  { dx: 20, dy: 10, size: 10, delay: 10 },
  { dx: 8, dy: 22, size: 12, delay: 50 },
  { dx: -10, dy: 20, size: 8, delay: 30 },
  { dx: -24, dy: 8, size: 13, delay: 70 },
];

interface SmokeParticleProps {
  dx: number;
  dy: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
  startTrigger: boolean;
  upwardDrift?: number;
  zIndex?: number;
  /** Half the host circle's size — particles emit from its middle. */
  center?: number;
}

export const SmokeParticle: React.FC<SmokeParticleProps> = ({
  dx,
  dy,
  size,
  color,
  delay,
  duration,
  startTrigger,
  upwardDrift = 0,
  zIndex = 50,
  center = 18,
}) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (startTrigger) {
      progress.value = withDelay(
        delay,
        withTiming(1, { duration, easing: Easing.out(Easing.quad) }),
      );
    } else {
      progress.value = 0;
    }
  }, [startTrigger]);

  const style = useAnimatedStyle(() => {
    const translateX = progress.value * dx;
    const translateY = progress.value * dy - progress.value * upwardDrift;
    const scale = interpolate(
      progress.value,
      [0, 0.3, 1],
      [0.2, 1.2, 0.4],
      Extrapolation.CLAMP,
    );
    const opacity = interpolate(
      progress.value,
      [0, 0.7, 1],
      [0, 0.9, 0],
      Extrapolation.CLAMP,
    );

    return {
      position: "absolute",
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: color,
      top: 18 - size / 2,
      left: 18 - size / 2,
      transform: [{ translateX }, { translateY }, { scale }],
      opacity,
      zIndex,
    };
  });

  return <Animated.View style={style} pointerEvents="none" />;
};
