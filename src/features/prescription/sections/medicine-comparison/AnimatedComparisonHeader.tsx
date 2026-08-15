import Animated, {
  useAnimatedStyle,
  SharedValue,
} from "react-native-reanimated";
import React from "react";
import { View } from "react-native";
import { ComparisonTabHeader } from "./ComparisonTabHeader";

interface AnimatedComparisonHeaderProps {
  scrollYShared: SharedValue<number>;
  medicinesSectionLayout: { y: number; height: number };
}

export const AnimatedComparisonHeader: React.FC<
  AnimatedComparisonHeaderProps
> = ({ scrollYShared, medicinesSectionLayout }) => {
  const headerAnimatedStyle = useAnimatedStyle(() => {
    const endOfList = medicinesSectionLayout.y + medicinesSectionLayout.height;
    if (endOfList === 0) return { opacity: 1, transform: [{ translateY: 0 }] };

    // Start fading/sliding out when scrolling past the last card
    const hideStart = endOfList - 160;
    const hideEnd = endOfList - 40;
    const range = hideEnd - hideStart;

    const y = scrollYShared.value;

    let opacity = 1;
    let translateY = 0;

    if (y > hideStart) {
      const progress = Math.min((y - hideStart) / range, 1);
      opacity = 1 - progress;
      translateY = -50 * progress;
    }

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  return (
    <View
      pointerEvents="box-none"
      style={{
        zIndex: 50,
        backgroundColor: "transparent",
      }}
    >
      <Animated.View style={headerAnimatedStyle}>
        <ComparisonTabHeader />
      </Animated.View>
    </View>
  );
};
