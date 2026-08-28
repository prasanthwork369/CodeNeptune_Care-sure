import React, { useEffect, useState } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { CONFETTI_COLORS } from "../constants/checkout.constants";

interface PieceConfig {
  id: number;
  x: number;
  color: string;
  w: number;
  h: number;
  delay: number;
  duration: number;
  endRotation: number;
}

function createConfettiPieces(width: number): PieceConfig[] {
  return Array.from({ length: 32 }, (_, i) => ({
    id: i,
    x: Math.random() * (width - 14),
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    w: 6 + Math.random() * 7,
    h: 3 + Math.random() * 5,
    delay: Math.random() * 550,
    duration: 1700 + Math.random() * 900,
    endRotation: Math.random() * 720 - 360,
  }));
}

const ConfettiPiece: React.FC<PieceConfig & { screenH: number }> = ({
  x,
  color,
  w,
  h,
  delay,
  duration,
  endRotation,
  screenH,
}) => {
  const ty = useSharedValue(-30);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    ty.value = withDelay(
      delay,
      withTiming(screenH + 80, {
        duration,
        easing: Easing.in(Easing.quad),
      }),
    );
    rotate.value = withDelay(delay, withTiming(endRotation, { duration }));
    opacity.value = withDelay(
      delay,
      withSequence(
        withTiming(1, { duration: 80 }),
        withTiming(1, {
          duration: Math.max(0, duration - 80 - duration * 0.3),
        }),
        withTiming(0, { duration: duration * 0.3 }),
      ),
    );
  }, [delay, duration, endRotation, opacity, rotate, screenH, ty]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: ty.value }, { rotate: `${rotate.value}deg` }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.piece,
        {
          left: x,
          width: w,
          height: h,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
};

export const OrderSuccessConfetti: React.FC<{ screenH?: number }> = ({
  screenH = 700,
}) => {
  const { width } = useWindowDimensions();
  const [pieces] = useState<PieceConfig[]>(() => createConfettiPieces(width));

  return (
    <View pointerEvents="none" style={styles.container}>
      {pieces.map((p) => (
        <ConfettiPiece key={p.id} {...p} screenH={screenH} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  piece: {
    position: "absolute",
    top: 0,
    borderRadius: 2,
  },
});
