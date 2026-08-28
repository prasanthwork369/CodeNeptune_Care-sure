import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { colors } from "@/src/constants/theme";
import { icons } from "@/src/constants/icons";
import Animated, {
  SharedValue,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Easing,
  runOnJS,
} from "react-native-reanimated";

import { useFlyToCart, ActiveAnimation } from "./FlyToCartContext";

const IMAGE_SIZE = 64;

// High zIndex to render above all other UI components during animation
const OVERLAY_Z_INDEX = 200;

interface FloatingItemProps {
  item: ActiveAnimation;
  destination: SharedValue<{ x: number; y: number }>;
  onComplete: () => void;
}

const FloatingItem: React.FC<FloatingItemProps> = ({
  item,
  destination,
  onComplete,
}) => {
  const progress = useSharedValue(0);
  const { startX, startY } = item;

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

    // Live target coordinates
    const { x: endX, y: endY } = destination.value;

    // Linear path calculation
    const x = startX + t * (endX - startX);
    const y = startY + t * (endY - startY);

    // Shrinks size along travel path
    const scale = interpolate(t, [0, 0.8, 1.0], [1.0, 0.6, 0.3]);

    // Fade in at start, fade out on landing
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
      borderColor: colors.primary,
      opacity,
      transform: [{ scale }],
    };
  });

  const [hasError, setHasError] = React.useState(false);

  // Normalize image source (supports remote URI string, ImageSource object, or local require number)
  // Falsy values, empty strings, and empty URI objects resolve to undefined so the local placeholder SVG renders.
  const imageSource = React.useMemo(() => {
    if (!item.imageUrl) return undefined;
    if (typeof item.imageUrl === "number") return item.imageUrl;
    if (typeof item.imageUrl === "string") {
      const trimmed = item.imageUrl.trim();
      return trimmed.length > 0 ? { uri: trimmed } : undefined;
    }
    if (typeof item.imageUrl === "object") {
      if ("uri" in item.imageUrl) {
        const uri = item.imageUrl.uri;
        if (typeof uri === "string" && uri.trim().length > 0) {
          return { ...item.imageUrl, uri: uri.trim() };
        }
        return undefined;
      }
      return item.imageUrl;
    }
    return undefined;
  }, [item.imageUrl]);

  const showImage = Boolean(imageSource && !hasError);

  return (
    <Animated.View style={[animatedStyle, styles.shadow]} pointerEvents="none">
      {showImage ? (
        <Image
          source={imageSource}
          style={styles.image}
          contentFit="contain"
          cachePolicy="memory-disk"
          onError={() => setHasError(true)}
        />
      ) : (
        <icons.placeholder width="65%" height="65%" />
      )}
    </Animated.View>
  );
};

export const FlyToCartOverlay: React.FC = () => {
  const { activeAnimations, handleComplete, destinationShared } =
    useFlyToCart();

  if (activeAnimations.length === 0) return null;

  return (
    <View
      style={[StyleSheet.absoluteFill, { zIndex: OVERLAY_Z_INDEX }]}
      pointerEvents="none"
    >
      {activeAnimations.map((anim) => (
        <FloatingItem
          key={anim.id}
          item={anim}
          destination={destinationShared}
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
