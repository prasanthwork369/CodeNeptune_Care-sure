import { MEDICINE_COLUMNS } from "@/src/constants/images";
import { colors } from "@/src/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const ScrollingColumn = ({
  images,
  duration,
  colorOffset = 0,
}: {
  images: readonly any[];
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

  React.useEffect(() => {
    translateY.value = withRepeat(
      withTiming(-cycleHeight, {
        duration,
        easing: Easing.linear,
      }),
      -1,
      false,
    );
  }, [cycleHeight, duration]);

  return (
    <Animated.View style={animatedStyle} className="mx-2">
      {[...images, ...images, ...images].map((img, idx) => {
        const bgColor =
          colors.pastels[(idx + colorOffset) % colors.pastels.length];
        return (
          <View
            key={idx}
            style={{
              width: itemSize,
              height: itemSize,
              marginBottom: gap,
              backgroundColor: bgColor,
              borderRadius: 20,
              borderWidth: 1.25,
              borderColor: "#919EAB33",
              shadowColor: "#919EAB",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 6,
              elevation: 2,
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

export const AuthMedicineBackground = () => {
  return (
    <View className="flex-row justify-center h-full overflow-hidden bg-slate-50">
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

      {/* Bottom Professional Linear Gradient Fade */}
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
};
