import { Touchable } from "@/src/components/ui/Touchable";
import { ANIMATIONS } from "@/src/constants/images";
import { DotLottie } from "@lottiefiles/dotlottie-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
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
  const adjustedBottom = useAdjustedBottomInset();
  const { height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const enterProgress = useSharedValue(0);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsNavigating(false);
      enterProgress.value = withTiming(1, {
        duration: 280,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      enterProgress.value = withTiming(
        0,
        {
          duration: 200,
          easing: Easing.in(Easing.quad),
        },
        (finished) => {
          if (finished && onClosed) {
            runOnJS(onClosed)();
          }
        },
      );
    }
  }, [isVisible, onClosed, enterProgress]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: enterProgress.value,
  }));

  const cardAnimStyle = useAnimatedStyle(() => ({
    opacity: enterProgress.value,
    transform: [
      {
        scale: interpolate(enterProgress.value, [0, 1], [0.93, 1]),
      },
    ],
  }));

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <Animated.View
        style={[
          styles.backdrop,
          backdropStyle,
        ]}
      />
      <Pressable
        style={styles.backdropTouch}
        onPress={onClose}
      />

      {/* Centered popup */}
      <View
        style={[
          styles.centerContainer,
          { paddingBottom: adjustedBottom },
        ]}
        pointerEvents="box-none"
      >
        <Animated.View
          style={[
            styles.card,
            {
              maxHeight: Math.max(
                0,
                screenHeight - insets.top - insets.bottom - exactScale(32),
              ),
            },
            cardAnimStyle,
          ]}
        >
          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            style={{ flexShrink: 1 }}
            contentContainerStyle={styles.scrollContent}
          >
            <DotLottie
              source={ANIMATIONS.pharmacy}
              autoplay
              loop
              style={styles.lottie}
            />

            <Text style={styles.title}>
              Reviewing Your Prescription
            </Text>

            <Text style={styles.subtitle}>
              Our licensed pharmacist is carefully checking your prescription
              and preparing your medicines
            </Text>
          </ScrollView>

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
            style={styles.gotItBtn}
          >
            {isNavigating ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.gotItBtnText}>
                GOT IT
              </Text>
            )}
          </Touchable>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
  },
  backdropTouch: {
    ...StyleSheet.absoluteFill,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: exactScale(24),
  },
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: exactScale(24),
    paddingHorizontal: exactScale(24),
    paddingTop: exactScale(28),
    paddingBottom: exactScale(24),
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 16,
  },
  scrollContent: {
    alignItems: "center",
  },
  lottie: {
    width: exactScale(200),
    height: exactScale(200),
  },
  title: {
    fontSize: moderateScale(20),
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginTop: exactScale(4),
    marginBottom: exactScale(8),
  },
  subtitle: {
    fontSize: moderateScale(13),
    fontWeight: "400",
    color: "#6B7280",
    textAlign: "center",
    lineHeight: moderateScale(20),
    marginBottom: exactScale(24),
  },
  gotItBtn: {
    width: "100%",
    backgroundColor: "#0F7635",
    borderRadius: exactScale(14),
    paddingVertical: exactScale(16),
    alignItems: "center",
    justifyContent: "center",
  },
  gotItBtnText: {
    fontSize: moderateScale(15),
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
