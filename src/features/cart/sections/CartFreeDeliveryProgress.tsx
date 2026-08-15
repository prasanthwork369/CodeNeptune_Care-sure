import { icons } from "@/src/constants/icons";
import { CartFreeDeliveryProgressProps } from "@/src/features/cart/types";
import { exactScale } from "@/src/utils/exactScale";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import { Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { cartStyles as s } from "../cart.styles";
import { AnimatedDeliveryRider } from "./AnimatedDeliveryRider";

export const CartFreeDeliveryProgress: React.FC<
  CartFreeDeliveryProgressProps
> = ({ remainingForFreeDelivery, progress }) => {
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round(progress * 100)),
  );
  const reduceMotion = useReducedMotion();
  const unlockedTextScale = useSharedValue(1);
  const wasUnlockedRef = useRef(remainingForFreeDelivery <= 0);

  useEffect(() => {
    const isUnlocked = remainingForFreeDelivery <= 0;
    const justUnlocked = !wasUnlockedRef.current && isUnlocked;
    wasUnlockedRef.current = isUnlocked;
    if (!justUnlocked || reduceMotion) return;

    unlockedTextScale.value = withSequence(
      withTiming(1.1, { duration: 140, easing: Easing.out(Easing.quad) }),
      withTiming(1, { duration: 180, easing: Easing.inOut(Easing.quad) }),
    );
  }, [reduceMotion, remainingForFreeDelivery, unlockedTextScale]);

  const unlockedTextStyle = useAnimatedStyle(() => ({
    transform: [{ scale: unlockedTextScale.value }],
  }));

  return (
    <LinearGradient
      colors={["#FFF6ED", "#FFFFFF"]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={{
        marginHorizontal: exactScale(16),
        marginTop: exactScale(12),
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#919EAB33",
      }}
    >
      <View
        style={{
          paddingHorizontal: exactScale(16),
          paddingVertical: exactScale(16),
        }}
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={
          remainingForFreeDelivery > 0
            ? `Shop ₹${Number(remainingForFreeDelivery).toFixed(2)} more for free delivery`
            : "Free delivery unlocked"
        }
        accessibilityValue={{ min: 0, max: 100, now: progressPercent }}
      >
        <View className="flex-row items-center">
          <icons.moped_package width={exactScale(22)} height={exactScale(20)} />
          <Text
            style={[s.progressText, { marginLeft: exactScale(8) }]}
            className="font-inter-medium text-[#1A1C1E]"
          >
            {remainingForFreeDelivery > 0 ? (
              <>
                Shop{" "}
                <Text className="font-inter-extrabold">
                  ₹{Number(remainingForFreeDelivery).toFixed(2)}
                </Text>{" "}
                more to free delivery
              </>
            ) : (
              <Animated.Text
                className="font-inter-semibold"
                style={unlockedTextStyle}
              >
                {"You've unlocked free delivery!"}
              </Animated.Text>
            )}
          </Text>
        </View>

        <AnimatedDeliveryRider
          progress={progress}
          remainingForFreeDelivery={remainingForFreeDelivery}
        />
      </View>
    </LinearGradient>
  );
};
