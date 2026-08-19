import React from "react";
import Animated, {
  useAnimatedStyle,
  interpolate,
  interpolateColor,
  SharedValue,
} from "react-native-reanimated";

interface CarouselDotProps {
  index: number;
  progress: SharedValue<number>;
  total: number;
}

export const CarouselDot: React.FC<CarouselDotProps> = React.memo(
  ({ index, progress, total }) => {
    const style = useAnimatedStyle(() => {
      const norm = ((progress.value % total) + total) % total;

      // Wrap-around looping distance math
      let dist = Math.abs(norm - index);
      if (dist > total / 2) {
        dist = total - dist;
      }

      // Active width (16px) vs inactive width (6px)
      const widthVal = interpolate(dist, [0, 1], [16, 6], "clamp");

      // Active color vs inactive color
      const colorVal = interpolateColor(dist, [0, 1], ["#008097", "#D1D5DB"]);

      return {
        width: widthVal,
        backgroundColor: colorVal,
      };
    });

    return <Animated.View style={[{ height: 6, borderRadius: 3 }, style]} />;
  },
);

CarouselDot.displayName = "CarouselDot";
