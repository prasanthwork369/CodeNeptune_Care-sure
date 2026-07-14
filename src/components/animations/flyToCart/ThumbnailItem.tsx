import { Image } from "expo-image";
import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { PARTICLE_CONFIGS, SmokeParticle } from "./SmokeParticle";

interface ThumbnailItemProps {
  imgUrl: string;
  index: number;
  isPending?: boolean;
  isRemoving?: boolean;
  isBehindRemoving?: boolean;
}

export const ThumbnailItem: React.FC<ThumbnailItemProps> = ({
  imgUrl,
  index,
  isPending,
  isRemoving,
  isBehindRemoving,
}) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const maskScale = useSharedValue(0);
  const imageScale = useSharedValue(1);

  useEffect(() => {
    if (isRemoving) {
      maskScale.value = withTiming(1, {
        duration: 250,
        easing: Easing.out(Easing.quad),
      });
      imageScale.value = withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.quad),
      });
      scale.value = withDelay(200, withTiming(0, { duration: 200 }));
      opacity.value = withDelay(200, withTiming(0, { duration: 200 }));
    } else if (isBehindRemoving) {
      scale.value = 1;
      opacity.value = 1;
      maskScale.value = 0;
      imageScale.value = 1;
    } else if (!isPending) {
      scale.value = withTiming(1, { duration: 180 });
      opacity.value = withTiming(1, { duration: 180 });
      maskScale.value = 0;
      imageScale.value = 1;
    } else {
      scale.value = 0;
      opacity.value = 0;
      maskScale.value = 0;
      imageScale.value = 1;
    }
  }, [isPending, isRemoving, isBehindRemoving]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const maskStyle = useAnimatedStyle(() => ({
    transform: [{ scale: maskScale.value }],
  }));

  const imageAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: imageScale.value }],
  }));

  const shouldPlaySmoke = isRemoving || isBehindRemoving;

  return (
    <View
      style={{
        width: 36,
        height: 36,
        marginLeft: index > 0 ? -12 : 0,
        zIndex: 10 - index,
        position: "relative",
      }}
    >
      {/* Green puff — renders above the thumbnail circle (zIndex: 5) */}
      {shouldPlaySmoke &&
        PARTICLE_CONFIGS.map((p, idx) => (
          <SmokeParticle
            key={`green-${idx}`}
            dx={p.dx}
            dy={p.dy}
            size={p.size}
            color="#22C55E"
            delay={p.delay}
            duration={320}
            startTrigger={true}
            upwardDrift={12}
            zIndex={5}
          />
        ))}

      {/* White puff — second wave, also above thumbnail */}
      {shouldPlaySmoke &&
        PARTICLE_CONFIGS.map((p, idx) => (
          <SmokeParticle
            key={`white-${idx}`}
            dx={p.dx}
            dy={p.dy}
            size={p.size * 0.9}
            color="#F1F5F9"
            delay={p.delay + 220}
            duration={300}
            startTrigger={true}
            upwardDrift={55}
            zIndex={5}
          />
        ))}

      <Animated.View
        style={[
          style,
          {
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: "#fff",
            borderWidth: 2,
            borderColor: "#fff",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.12,
            shadowRadius: 3,
            elevation: 3,
            overflow: "hidden",
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 1,
          },
        ]}
      >
        <Animated.View
          style={[
            {
              width: 28,
              height: 28,
              alignItems: "center",
              justifyContent: "center",
            },
            imageAnimatedStyle,
          ]}
        >
          <Image
            source={imgUrl}
            style={{ width: 28, height: 28 }}
            contentFit="contain"
          />
        </Animated.View>

        {/* Absolute Mask Overlay (Green matching the banner background) */}
        <Animated.View
          style={[
            maskStyle,
            {
              position: "absolute",
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: "#0F7635",
              top: 0,
              left: 0,
            },
          ]}
        />
      </Animated.View>
    </View>
  );
};
