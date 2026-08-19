import { addDigitsOnlyLimitListener } from "@/src/modules/TextInputFilter";
import { moderateScale, scale, verticalScale } from "@/src/utils/exactScale";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Text, View } from "react-native";

const DISPLAY_MS = 2000;

/**
 * Small dark pill shown as an absolute floating overlay right below the phone field
 * (between the input and Get OTP button) when the native filter blocks an 11th digit.
 * Purely visual, floating, and non-interactive — it does not expand layout gaps.
 */
export const PhoneLimitToast: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [opacity] = useState(() => new Animated.Value(0));
  const [translateY] = useState(() => new Animated.Value(6));
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsubscribe = addDigitsOnlyLimitListener(() => {
      if (timer.current) clearTimeout(timer.current);
      setVisible(true);
      opacity.setValue(0);
      translateY.setValue(6);

      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 160, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 160, useNativeDriver: true }),
      ]).start();

      timer.current = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: 6, duration: 180, useNativeDriver: true }),
        ]).start(() => setVisible(false));
      }, DISPLAY_MS);
    });

    return () => {
      if (timer.current) clearTimeout(timer.current);
      unsubscribe();
    };
  }, [opacity, translateY]);

  if (!visible) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: "100%",
        marginTop: verticalScale(0),
        left: 0,
        right: 0,
        alignItems: "center",
        zIndex: 9999,
        opacity,
        transform: [{ translateY }],
      }}
    >
      <View
        style={{
          backgroundColor: "#262626",
          borderRadius: scale(24),
          paddingVertical: verticalScale(8),
          paddingHorizontal: scale(16),
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 4,
          elevation: 5,
        }}
      >
        <Text
          style={{
            color: "#F5F5F5",
            fontSize: moderateScale(12.5),
            fontWeight: "500",
          }}
        >
          You can only enter 10 digits
        </Text>
      </View>
    </Animated.View>
  );
};
