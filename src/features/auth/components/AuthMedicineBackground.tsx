import { MEDICINE_COLUMNS } from "@/src/constants/images";
import { colors } from "@/src/constants/theme";
import { useIsVisible } from "@/src/hooks/ui/useVisibleInterval";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, ImageSourcePropType, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const ScrollingColumn = ({
  images,
  duration,
  colorOffset = 0,
}: {
  images: readonly ImageSourcePropType[];
  duration: number;
  colorOffset?: number;
}) => {
  const translateY = useSharedValue(0);

  // Each item is 100px + gap (16px) = 116px
  const itemSize = 100;
  const gap = 16;
  const cycleHeight = images.length * (itemSize + gap);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const isVisible = useIsVisible();

  React.useEffect(() => {
    // An infinite withRepeat keeps the UI thread working forever, so it must
    // stop when this screen isn't focused or the app is backgrounded.
    if (!isVisible) {
      cancelAnimation(translateY);
      return;
    }
    // Finish the current leg at the same speed instead of the full duration,
    // so resuming from a paused mid-scroll position doesn't look slower.
    const remaining = cycleHeight + translateY.value;
    const remainingDuration = duration * (remaining / cycleHeight);
    translateY.value = withSequence(
      withTiming(-cycleHeight, {
        duration: remainingDuration,
        easing: Easing.linear,
      }),
      withTiming(0, { duration: 0 }),
      withRepeat(
        withSequence(
          withTiming(-cycleHeight, { duration, easing: Easing.linear }),
          withTiming(0, { duration: 0 }),
        ),
        -1,
        false,
      ),
    );
  }, [cycleHeight, duration, translateY, isVisible]);

  return (
    <Animated.View style={animatedStyle} className="mx-2">
      {[...images, ...images, ...images].map((img, idx) => {
        const bgColor =
          colors.pastels[
            ((idx % images.length) + colorOffset) % colors.pastels.length
          ];
        return (
          <View
            key={idx}
            style={{
              width: itemSize,
              height: itemSize,
              marginBottom: gap,
              backgroundColor: bgColor,
              borderRadius: 20,
              borderWidth: 0.5,
              borderColor: "#919EAB33",
            }}
            className="items-center justify-center p-3"
          >
            <Image
              source={img}
              style={{ width: "80%", height: "80%" }}
              resizeMode="contain"
            />
          </View>
        );
      })}
    </Animated.View>
  );
};

// Memoised: 4 columns x 12 tiles, and the panel re-renders on every keystroke.
export const AuthMedicineBackground = React.memo(() => {
  return (
    <View className="flex-row justify-center h-full overflow-hidden bg-white">
      <View className="mt-10 mx-1">
        <ScrollingColumn
          images={MEDICINE_COLUMNS.column1}
          duration={12000}
          colorOffset={0}
        />
      </View>
      <View className="-mt-20 mx-1">
        <ScrollingColumn
          images={MEDICINE_COLUMNS.column2}
          duration={12000}
          colorOffset={2}
        />
      </View>
      <View className="mt-5 mx-1">
        <ScrollingColumn
          images={MEDICINE_COLUMNS.column3}
          duration={12000}
          colorOffset={4}
        />
      </View>
      <View className="-mt-10 mx-1">
        <ScrollingColumn
          images={[...MEDICINE_COLUMNS.column1].reverse()}
          duration={12000}
          colorOffset={1}
        />
      </View>

      {/* Top Subtle Gradient for Status Bar Visibility */}
      <LinearGradient
        colors={["rgba(255,255,255,0.7)", "rgba(255,255,255,0)"]}
        style={{ position: "absolute", top: 0, left: 0, right: 0, height: 100 }}
        pointerEvents="none"
      />

      {/* Bottom Professional Linear Gradient Fade — 150 matches
          AuthScreenShell's backgroundStyle shrink-minimum (verticalScale(150))
          on purpose, so the fade always reaches solid white exactly at the
          form panel's top edge instead of leaving a hard-edged seam there. */}
      <LinearGradient
        colors={[
          "rgba(255,255,255,0)",
          "rgba(255,255,255,0.5)",
          "rgba(255,255,255,0.9)",
          "#FFFFFF",
        ]}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 150,
        }}
        pointerEvents="none"
      />
    </View>
  );
});

AuthMedicineBackground.displayName = "AuthMedicineBackground";
