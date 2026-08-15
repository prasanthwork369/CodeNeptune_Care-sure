import { icons } from "@/src/constants/icons";
import { exactScale } from "@/src/utils/exactScale";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const BAR_HEIGHT = exactScale(6);
const RIDER_WIDTH = exactScale(38);
const RIDER_HEIGHT = exactScale(36);
const RIDER_DRAW_SIZE = Math.min(RIDER_WIDTH, RIDER_HEIGHT);
const RIDER_X_INSET = (RIDER_WIDTH - RIDER_DRAW_SIZE) / 2;
const WHEEL_SIZE = (6 / 24) * RIDER_DRAW_SIZE;
const WHEEL_TOP = (18.5 / 24) * RIDER_HEIGHT - WHEEL_SIZE / 2;
const REAR_WHEEL_LEFT =
  RIDER_X_INSET + (5.5 / 24) * RIDER_DRAW_SIZE - WHEEL_SIZE / 2;
const FRONT_WHEEL_LEFT =
  RIDER_X_INSET + (18.3 / 24) * RIDER_DRAW_SIZE - WHEEL_SIZE / 2;
const FRONT_WHEEL_RIGHT_INSET = RIDER_WIDTH - (FRONT_WHEEL_LEFT + WHEEL_SIZE);
const PROGRESS_WHEEL_OVERLAP = exactScale(1);
const RIDER_TOP_OFFSET =
  BAR_HEIGHT / 2 - (WHEEL_TOP + WHEEL_SIZE / 2) - exactScale(1);
const DRIVE_DURATION = 640;

interface AnimatedDeliveryRiderProps {
  progress: number;
  remainingForFreeDelivery: number;
}

export const AnimatedDeliveryRider: React.FC<AnimatedDeliveryRiderProps> = ({
  progress,
  remainingForFreeDelivery,
}) => {
  const clampedProgress = Math.min(1, Math.max(0, progress));
  const reduceMotion = useReducedMotion();
  const [barWidth, setBarWidth] = useState(0);
  const progressShared = useSharedValue(clampedProgress);
  const bounceY = useSharedValue(0);
  const tilt = useSharedValue(0);
  const celebrationTilt = useSharedValue(0);
  const celebrationY = useSharedValue(0);
  const successScale = useSharedValue(1);
  const previousRemainingRef = useRef(remainingForFreeDelivery);

  useEffect(() => {
    if (reduceMotion) {
      progressShared.value = clampedProgress;
      bounceY.value = 0;
      tilt.value = 0;
      return;
    }

    progressShared.value = withTiming(clampedProgress, {
      duration: DRIVE_DURATION,
      easing: Easing.inOut(Easing.cubic),
    });
    bounceY.value = withRepeat(
      withSequence(
        withTiming(-exactScale(2), {
          duration: 80,
          easing: Easing.out(Easing.quad),
        }),
        withTiming(0, {
          duration: 80,
          easing: Easing.in(Easing.quad),
        }),
      ),
      4,
      false,
    );
    tilt.value = withSequence(
      withTiming(1.5, { duration: 160, easing: Easing.out(Easing.quad) }),
      withTiming(0.5, {
        duration: 320,
        easing: Easing.inOut(Easing.quad),
      }),
      withTiming(0, {
        duration: 160,
        easing: Easing.inOut(Easing.quad),
      }),
    );
  }, [bounceY, clampedProgress, progressShared, reduceMotion, tilt]);

  useEffect(() => {
    const justUnlocked =
      previousRemainingRef.current > 0 && remainingForFreeDelivery <= 0;
    previousRemainingRef.current = remainingForFreeDelivery;
    if (!justUnlocked) return;

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
      () => undefined,
    );
    if (reduceMotion) return;

    successScale.value = withSequence(
      withTiming(1.18, { duration: 120, easing: Easing.out(Easing.quad) }),
      withTiming(1, {
        duration: 130,
        easing: Easing.inOut(Easing.quad),
      }),
    );
    celebrationTilt.value = withSequence(
      withTiming(-5, { duration: 90, easing: Easing.out(Easing.quad) }),
      withTiming(5, { duration: 100, easing: Easing.inOut(Easing.quad) }),
      withTiming(0, { duration: 110, easing: Easing.inOut(Easing.quad) }),
    );
    celebrationY.value = withSequence(
      withTiming(-exactScale(4), {
        duration: 120,
        easing: Easing.out(Easing.cubic),
      }),
      withTiming(0, {
        duration: 150,
        easing: Easing.in(Easing.cubic),
      }),
    );
  }, [
    celebrationTilt,
    celebrationY,
    reduceMotion,
    remainingForFreeDelivery,
    successScale,
  ]);

  const riderStyle = useAnimatedStyle(() => {
    const startLeft = -REAR_WHEEL_LEFT - PROGRESS_WHEEL_OVERLAP;
    const maxLeft = Math.max(
      barWidth - RIDER_WIDTH + FRONT_WHEEL_RIGHT_INSET,
      0,
    );
    const riderLeft = Math.max(
      startLeft,
      Math.min(
        progressShared.value * barWidth -
          REAR_WHEEL_LEFT -
          PROGRESS_WHEEL_OVERLAP,
        maxLeft,
      ),
    );
    return {
      left: riderLeft,
      transform: [
        { translateY: bounceY.value + celebrationY.value },
        { rotate: `${tilt.value + celebrationTilt.value}deg` },
        { scale: successScale.value },
      ],
    };
  });

  const wheelStyle = useAnimatedStyle(() => {
    const startLeft = -REAR_WHEEL_LEFT - PROGRESS_WHEEL_OVERLAP;
    const maxLeft = Math.max(
      barWidth - RIDER_WIDTH + FRONT_WHEEL_RIGHT_INSET,
      0,
    );
    const riderLeft = Math.max(
      startLeft,
      Math.min(
        progressShared.value * barWidth -
          REAR_WHEEL_LEFT -
          PROGRESS_WHEEL_OVERLAP,
        maxLeft,
      ),
    );
    const travelled = riderLeft - startLeft;
    return {
      transform: [
        { rotate: `${(travelled / (Math.PI * WHEEL_SIZE)) * 360}deg` },
      ],
    };
  }, [barWidth]);

  const fillStyle = useAnimatedStyle(
    () => ({ width: progressShared.value * barWidth }),
    [barWidth],
  );

  return (
    <View style={{ marginTop: exactScale(20) }}>
      <View
        onLayout={(event) => setBarWidth(event.nativeEvent.layout.width)}
        style={{ height: BAR_HEIGHT }}
        className="overflow-hidden rounded-full bg-[#F1E2C9]"
      >
        <Animated.View
          className="h-full rounded-full bg-[#0B0D10]"
          style={fillStyle}
        />
      </View>

      <Animated.View
        style={[
          {
            position: "absolute",
            top: RIDER_TOP_OFFSET,
            width: RIDER_WIDTH,
            height: RIDER_HEIGHT,
          },
          riderStyle,
        ]}
      >
        <icons.delivery_rider width={RIDER_WIDTH} height={RIDER_HEIGHT} />
        {[REAR_WHEEL_LEFT, FRONT_WHEEL_LEFT].map((left, index) => (
          <Animated.View
            key={index === 0 ? "rear-wheel" : "front-wheel"}
            style={[
              {
                position: "absolute",
                top: WHEEL_TOP,
                left,
                width: WHEEL_SIZE,
                height: WHEEL_SIZE,
                borderRadius: WHEEL_SIZE / 2,
                borderWidth: exactScale(1.6),
                borderColor: "#1A1C1E",
                backgroundColor: "#FFFFFF",
                alignItems: "center",
                justifyContent: "center",
              },
              wheelStyle,
            ]}
          >
            <View
              style={{
                position: "absolute",
                width: WHEEL_SIZE - exactScale(2.5),
                height: exactScale(1),
                backgroundColor: "#1A1C1E",
              }}
            />
            <View
              style={{
                position: "absolute",
                width: exactScale(1),
                height: WHEEL_SIZE - exactScale(2.5),
                backgroundColor: "#1A1C1E",
              }}
            />
            <View
              style={{
                width: exactScale(2.2),
                height: exactScale(2.2),
                borderRadius: exactScale(1.1),
                backgroundColor: "#1A1C1E",
              }}
            />
          </Animated.View>
        ))}
      </Animated.View>
    </View>
  );
};
