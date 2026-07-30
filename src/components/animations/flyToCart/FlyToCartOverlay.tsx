import React, { useEffect } from "react";
import { View, StyleSheet, Image } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Easing,
  runOnJS,
} from "react-native-reanimated";

import { useFlyToCart, ActiveAnimation } from "./FlyToCartContext";

const IMAGE_SIZE = 64;

interface FloatingItemProps {
  item: ActiveAnimation;
  onComplete: () => void;
}

const FloatingItem: React.FC<FloatingItemProps> = ({ item, onComplete }) => {
  const progress = useSharedValue(0);
  const { startX, startY, endX, endY } = item;

  useEffect(() => {
    progress.value = withTiming(
      1,
      {
        duration: 750,
        easing: Easing.bezier(0.4, 0.0, 0.6, 1.0),
      },
      (finished) => {
        if (finished) runOnJS(onComplete)();
      },
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const t = progress.value;

    // Straight line: top to bottom
    const x = startX + t * (endX - startX);
    const y = startY + t * (endY - startY);

    // Shrinks as it travels down to the banner
    const scale = interpolate(t, [0, 0.8, 1.0], [1.0, 0.6, 0.3]);

    // Appears instantly, fades at landing
    const opacity = interpolate(t, [0, 0.04, 0.85, 1.0], [0, 1.0, 1.0, 0.0]);

    return {
      position: "absolute",
      left: x - IMAGE_SIZE / 2,
      top: y - IMAGE_SIZE / 2,
      width: IMAGE_SIZE,
      height: IMAGE_SIZE,
      borderRadius: IMAGE_SIZE / 2,
      backgroundColor: "#FFFFFF",
      borderWidth: 1.5,
      borderColor: "#0F7635",
      opacity,
      transform: [{ scale }],
    };
  });

  const imageSource =
    typeof item.imageUrl === "string" ? { uri: item.imageUrl } : item.imageUrl;

  return (
    <Animated.View style={[animatedStyle, styles.shadow]} pointerEvents="none">
      <Image source={imageSource} style={styles.image} resizeMode="contain" />
    </Animated.View>
  );
};

export const FlyToCartOverlay: React.FC = () => {
  const { activeAnimations, handleComplete } = useFlyToCart();

  if (activeAnimations.length === 0) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {activeAnimations.map((anim) => (
        <FloatingItem
          key={anim.id}
          item={anim}
          onComplete={() =>
            handleComplete(anim.id, anim.imageUrl, anim.productId)
          }
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    width: "80%",
    height: "80%",
    alignSelf: "center",
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 5,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
});
