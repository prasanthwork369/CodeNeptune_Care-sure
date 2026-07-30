import { LinearGradient } from "expo-linear-gradient";
import React, { memo, useCallback, useEffect, useState } from "react";
import {
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
  useWindowDimensions,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import type {
  EasingFunction,
  EasingFunctionFactory,
} from "react-native-reanimated";

export interface ShimmerOverlayProps {
  /** Match the host element's radius so the highlight cannot escape its shape. */
  borderRadius?: number;
  /** Milliseconds for a single left-to-right pass. */
  duration?: number;
  /** Optional idle interval before each pass; used by decorative consumers. */
  pause?: number;
  /** Shared primitive customization without duplicating the animation loop. */
  highlightOpacity?: number;
  angle?: number;
  /** Ratio of the host width used by the moving band. Defaults preserve skeletons. */
  bandWidthRatio?: number;
  /** Uses a five-stop soft falloff for decorative highlights only. */
  softEdges?: boolean;
  easing?: EasingFunction | EasingFunctionFactory;
  /** Set false when an off-screen list cell should not animate. */
  enabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

const AnimatedView = Animated.createAnimatedComponent(View);

/**
 * Native-thread glossy highlight for an already-sized loading surface.
 * It is absolute and has no layout dimensions of its own, so it cannot cause
 * layout shift. Memoization keeps parent list updates from re-rendering it.
 */
export const ShimmerOverlay = memo(function ShimmerOverlay({
  borderRadius = 0,
  duration = 1150,
  pause = 0,
  highlightOpacity = 0.7,
  angle = 0,
  bandWidthRatio = 1,
  softEdges = false,
  easing = Easing.linear,
  enabled = true,
  style,
}: ShimmerOverlayProps) {
  const { width: windowWidth } = useWindowDimensions();
  const [measuredWidth, setMeasuredWidth] = useState(0);
  const progress = useSharedValue(0);
  // Loading shimmer retains its existing screen-width travel. Promotional
  // badges opt into their measured width so small chips sweep visibly.
  const travelDistance = Math.max(
    bandWidthRatio === 1 ? windowWidth : measuredWidth || windowWidth,
    1,
  );
  // A rotated, narrow offer strip needs extra travel so its corners leave the
  // clipped badge before the next cycle resets it to the left.
  const stripWidth = angle ? travelDistance * 0.42 : travelDistance;
  const startX = angle ? -(travelDistance + stripWidth) : -travelDistance;
  const endX = angle ? travelDistance + stripWidth : travelDistance;

  useEffect(() => {
    if (!enabled) {
      progress.value = 0;
      return;
    }

    const pass = withTiming(1, {
      duration,
      easing,
    });
    progress.value =
      pause > 0
        ? withRepeat(
            withSequence(
              withDelay(pause, pass),
              withTiming(0, { duration: 0 }),
            ),
            -1,
            false,
          )
        : withRepeat(pass, -1, false);

    return () => {
      progress.value = 0;
    };
  }, [duration, easing, enabled, pause, progress]);

  const handleLayout = useCallback(
    (event: { nativeEvent: { layout: { width: number } } }) => {
      if (bandWidthRatio !== 1)
        setMeasuredWidth(event.nativeEvent.layout.width);
    },
    [bandWidthRatio],
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: startX + progress.value * (endX - startX) },
      { rotateZ: `${angle}deg` },
    ],
  }));

  const highlight = softEdges
    ? ([
        "transparent",
        `rgba(255,255,255,${highlightOpacity * 0.22})`,
        `rgba(255,255,255,${highlightOpacity})`,
        `rgba(255,255,255,${highlightOpacity * 0.22})`,
        "transparent",
      ] as const)
    : ([
        "transparent",
        `rgba(255,255,255,${highlightOpacity})`,
        "transparent",
      ] as const);

  return (
    <View
      pointerEvents="none"
      onLayout={handleLayout}
      style={[styles.clip, { borderRadius }, style]}
    >
      <AnimatedView
        style={[
          styles.highlightTrack,
          angle ? styles.diagonalTrack : null,
          { width: stripWidth },
          animatedStyle,
        ]}
      >
        <LinearGradient
          colors={highlight}
          locations={softEdges ? [0, 0.22, 0.5, 0.78, 1] : undefined}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </AnimatedView>
    </View>
  );
});

const styles = StyleSheet.create({
  clip: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  highlightTrack: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
  },
  diagonalTrack: {
    top: "-60%",
    bottom: "-60%",
  },
});
