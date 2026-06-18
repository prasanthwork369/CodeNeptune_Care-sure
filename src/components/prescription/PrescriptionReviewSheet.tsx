import { Touchable } from "@/src/components/ui/Touchable";
import { ANIMATIONS } from "@/src/constants/images";
import { DotLottie } from "@lottiefiles/dotlottie-react-native";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props {
  isVisible: boolean;
  onClose: () => void;
  onNotify?: () => void;
  onClosed?: () => void;
}

export const PrescriptionReviewSheet: React.FC<Props> = ({
  isVisible,
  onClose,
  onNotify,
  onClosed,
}) => {
  const insets = useSafeAreaInsets();

  // Single value drives backdrop + card opacity + card scale together.
  // One animation = one visual event, no perception of "double open".
  const enterAnim = useRef(new Animated.Value(0)).current;

  const cardScale = enterAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.93, 1],
  });

  const [isNavigating, setIsNavigating] = useState(false);
  const hasBeenShown = useRef(false);

  // Reset before the native frame paints — no stale values on first show.
  useLayoutEffect(() => {
    if (!isVisible) return;
    enterAnim.setValue(0);
  }, [isVisible]);

  useEffect(() => {
    let anim: Animated.CompositeAnimation;
    if (isVisible) {
      hasBeenShown.current = true;
      setIsNavigating(false);
      anim = Animated.timing(enterAnim, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      });
      anim.start();
    } else {
      if (!hasBeenShown.current) return;
      anim = Animated.timing(enterAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.in(Easing.quad),
      });
      anim.start(() => onClosed?.());
    }
    return () => anim?.stop();
  }, [isVisible]);

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      {/* Backdrop — driven by the same enterAnim as the card */}
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.55)",
          opacity: enterAnim,
        }}
      />
      <Pressable
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        onPress={onClose}
      />

      {/* Centered popup */}
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 24,
          paddingBottom: insets.bottom,
        }}
        pointerEvents="box-none"
      >
        <Animated.View
          style={{
            width: "100%",
            backgroundColor: "#FFFFFF",
            borderRadius: 24,
            paddingHorizontal: 24,
            paddingTop: 28,
            paddingBottom: 24,
            alignItems: "center",
            opacity: enterAnim,
            transform: [{ scale: cardScale }],
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.18,
            shadowRadius: 24,
            elevation: 16,
          }}
        >
          <DotLottie
            source={ANIMATIONS.pharmacy}
            autoplay
            loop
            style={{ width: 200, height: 200 }}
          />

          <Text
            style={{
              fontSize: 20,
              fontFamily: "Inter-Bold",
              color: "#111827",
              textAlign: "center",
              marginTop: 4,
              marginBottom: 8,
            }}
          >
            Reviewing Your Prescription
          </Text>

          <Text
            style={{
              fontSize: 13,
              fontFamily: "Inter-Regular",
              color: "#6B7280",
              textAlign: "center",
              lineHeight: 20,
              marginBottom: 24,
            }}
          >
            Our licensed pharmacist is carefully checking your prescription and
            preparing your medicines
          </Text>

          <Touchable
            activeOpacity={0.8}
            disabled={isNavigating}
            onPress={() => {
              setIsNavigating(true);
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  onNotify?.();
                });
              });
            }}
            style={{
              width: "100%",
              backgroundColor: "#0F7635",
              borderRadius: 14,
              paddingVertical: 16,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isNavigating ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text
                style={{
                  fontSize: 15,
                  fontFamily: "Inter-SemiBold",
                  color: "#FFFFFF",
                }}
              >
                GOT IT
              </Text>
            )}
          </Touchable>
        </Animated.View>
      </View>
    </Modal>
  );
};
