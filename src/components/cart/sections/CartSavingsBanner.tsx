import { OfferShine } from "@/src/components/ui/offerShine";
import { HOME_IMAGES } from "@/src/constants/images";
import { CartSavingsBannerProps } from "@/src/types/cart";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useState } from "react";
import { Text } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const AMOUNT_OFFSET = exactScale(4);
const AMOUNT_EXIT_DURATION = 90;
const AMOUNT_ENTER_DURATION = 130;

export const CartSavingsBanner: React.FC<CartSavingsBannerProps> = ({
  totalSavings,
}) => {
  const reduceMotion = useReducedMotion();
  const [displayedSavings, setDisplayedSavings] = useState(totalSavings);
  const amountOpacity = useSharedValue(1);
  const amountTranslateY = useSharedValue(0);

  const showUpdatedAmount = useCallback(
    (nextSavings: number) => {
      setDisplayedSavings(nextSavings);
      amountOpacity.value = 0;
      amountTranslateY.value = AMOUNT_OFFSET;
      amountOpacity.value = withTiming(1, {
        duration: AMOUNT_ENTER_DURATION,
        easing: Easing.out(Easing.quad),
      });
      amountTranslateY.value = withTiming(0, {
        duration: AMOUNT_ENTER_DURATION,
        easing: Easing.out(Easing.quad),
      });
    },
    [amountOpacity, amountTranslateY],
  );

  useEffect(() => {
    if (displayedSavings === totalSavings) return;

    cancelAnimation(amountOpacity);
    cancelAnimation(amountTranslateY);

    if (reduceMotion) {
      amountOpacity.value = 1;
      amountTranslateY.value = 0;
      setDisplayedSavings(totalSavings);
      return;
    }

    amountOpacity.value = withTiming(
      0,
      {
        duration: AMOUNT_EXIT_DURATION,
        easing: Easing.in(Easing.quad),
      },
      (finished) => {
        if (finished) runOnJS(showUpdatedAmount)(totalSavings);
      },
    );
    amountTranslateY.value = withTiming(-AMOUNT_OFFSET, {
      duration: AMOUNT_EXIT_DURATION,
      easing: Easing.in(Easing.quad),
    });
  }, [
    amountOpacity,
    amountTranslateY,
    displayedSavings,
    reduceMotion,
    showUpdatedAmount,
    totalSavings,
  ]);

  useEffect(
    () => () => {
      cancelAnimation(amountOpacity);
      cancelAnimation(amountTranslateY);
    },
    [amountOpacity, amountTranslateY],
  );

  const animatedAmountStyle = useAnimatedStyle(() => ({
    opacity: amountOpacity.value,
    transform: [{ translateY: amountTranslateY.value }],
  }));

  return (
    <LinearGradient
      colors={["#D0EBFE", "#D7FFEA"]}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: exactScale(16),
        paddingVertical: exactScale(12),
        gap: exactScale(10),
        overflow: "hidden",
      }}
      accessible
      accessibilityRole="summary"
      accessibilityLabel={`You saved ₹${Number(displayedSavings).toFixed(2)} on this order`}
    >
      <Image
        source={HOME_IMAGES.discountTag}
        style={{ width: exactScale(32), height: exactScale(32) }}
        contentFit="contain"
      />
      <Text
        style={{
          fontSize: moderateScale(14),
          fontWeight: "600",
          color: "#0A0A0A",
        }}
      >
        {"You saved  "}
        <Animated.Text
          className="font-inter-extrabold text-[#0A0A0A]"
          style={animatedAmountStyle}
        >
          ₹{parseFloat(displayedSavings.toFixed(2))}
        </Animated.Text>
        {" on this Order"}
      </Text>
      <OfferShine />
    </LinearGradient>
  );
};
