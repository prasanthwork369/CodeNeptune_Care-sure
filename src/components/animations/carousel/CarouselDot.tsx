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

      // Looping wrap-around distance math
      let dist = Math.abs(norm - index);
      if (dist > total / 2) {
        dist = total - dist;
      }

      // Interpolate width: 16 when active (dist === 0), 6 when inactive (dist >= 1)
      const widthVal = interpolate(dist, [0, 1], [16, 6], "clamp");

      // Interpolate color: '#008097' (active) to '#D1D5DB' (inactive)
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
