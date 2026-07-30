import React, { useEffect, useRef } from "react";
import { View, Text } from "react-native";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";

interface AnimatedCountProps {
  count: number;
}

export const AnimatedCount: React.FC<AnimatedCountProps> = ({ count }) => {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const prev = useRef(count);

  useEffect(() => {
    if (prev.current === count) return;
    const dir = count > prev.current ? -1 : 1;
    prev.current = count;
    opacity.value = withSequence(
      withTiming(0, { duration: 90 }),
      withTiming(1, { duration: 110 }),
    );
    translateY.value = withSequence(
      withTiming(dir * 7, { duration: 90, easing: Easing.in(Easing.quad) }),
      withTiming(0, { duration: 120, easing: Easing.out(Easing.back(1.2)) }),
    );
  }, [count]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (count === 0) return null;

  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <Animated.Text
        style={[
          style,
          {
            color: "#fff",
            fontSize: moderateScale(11.5),
            fontWeight: "500",
            opacity: 0.9,
            lineHeight: moderateScale(14),
          },
        ]}
      >
        {count}
      </Animated.Text>
      <Text
        style={{
          color: "#fff",
          fontSize: moderateScale(11.5),
          fontWeight: "500",
          opacity: 0.9,
          marginLeft: exactScale(4),
          lineHeight: moderateScale(14),
        }}
      >
        {count === 1 ? "item" : "items"}
      </Text>
    </View>
  );
};
