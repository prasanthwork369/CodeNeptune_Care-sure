import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { ANIMATIONS } from "@/src/constants/images";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { useNav } from "@/src/hooks/useNav";
import { exactScale } from "@/src/utils/exactScale";
import { formatOrderId } from "@/src/utils/order";
import { DotLottie } from "@lottiefiles/dotlottie-react-native";
import { useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect } from "react";
import { ScrollView, Text, useWindowDimensions, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { OrderSuccessConfetti } from "../components/OrderSuccessConfetti";
import { styles as s } from "./OrderSuccessLayout.styles";

export const OrderSuccessLayout: React.FC = () => {
  const router = useNav();
  const adjustedBottom = useAdjustedBottomInset();
  const { height } = useWindowDimensions();
  const { orderId = "", total = "0" } = useLocalSearchParams<{
    orderId: string;
    total: string;
  }>();

  // Entry animation
  const cardScale = useSharedValue(0.88);
  const cardOpacity = useSharedValue(0);
  const btnTranslate = useSharedValue(40);
  const btnOpacity = useSharedValue(0);

  // Drag to close
  const panY = useSharedValue(0);

  useEffect(() => {
    cardScale.value = withTiming(1, {
      duration: 350,
      easing: Easing.out(Easing.quad),
    });
    cardOpacity.value = withTiming(1, {
      duration: 300,
      easing: Easing.out(Easing.quad),
    });
    btnTranslate.value = withDelay(
      250,
      withTiming(0, { duration: 350, easing: Easing.out(Easing.quad) }),
    );
    btnOpacity.value = withDelay(
      250,
      withTiming(1, { duration: 300, easing: Easing.out(Easing.quad) }),
    );
  }, [btnOpacity, btnTranslate, cardOpacity, cardScale]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }, { translateY: panY.value }],
    opacity: cardOpacity.value,
  }));

  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: btnTranslate.value }],
    opacity: btnOpacity.value,
  }));

  const dismiss = useCallback(() => {
    router.back();
  }, [router]);

  /* eslint-disable react-hooks/immutability */
  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      panY.value = Math.max(0, e.translationY);
    })
    .onEnd((e) => {
      if (e.translationY > 120 || e.velocityY > 900) {
        panY.value = withTiming(height, {
          duration: 240,
          easing: Easing.in(Easing.quad),
        });
        runOnJS(dismiss)();
      } else {
        panY.value = withSpring(0, { damping: 22, stiffness: 300 });
      }
    });
  /* eslint-enable react-hooks/immutability */

  return (
    <View style={s.overlay}>
      <StatusBar style="light" />

      <Animated.View
        style={[
          cardStyle,
          s.sheetCard,
          { maxHeight: Math.max(0, height - exactScale(16)) },
        ]}
      >
        <OrderSuccessConfetti screenH={700} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          overScrollMode="auto"
          contentContainerStyle={[
            s.scrollContent,
            { paddingBottom: adjustedBottom + exactScale(24) },
          ]}
        >
          {/* Keep dismissal on the handle so content scrolling stays reliable. */}
          <GestureDetector gesture={panGesture}>
            <View hitSlop={16} style={s.handle} />
          </GestureDetector>

          <DotLottie
            source={ANIMATIONS.orderPlaced}
            autoplay
            loop={false}
            style={s.lottie}
          />

          <Text style={s.title}>Order Placed! 🎉</Text>
          <Text style={s.subtitle}>
            {"Your medicines are on their way.\nWe'll keep you updated."}
          </Text>

          <View style={s.summaryBox}>
            {orderId ? (
              <View style={s.summaryRow}>
                <Text style={s.summaryLabel}>Order ID</Text>
                <Text style={s.summaryValueDark}>{formatOrderId(orderId)}</Text>
              </View>
            ) : null}
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Amount Paid</Text>
              <Text style={s.summaryValueGreen}>
                ₹{Number(total).toFixed(2)}
              </Text>
            </View>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Delivery</Text>
              <Text style={s.summaryValueDark}>2–4 Business Days</Text>
            </View>
          </View>

          <Animated.View style={[btnStyle, s.btnWrap]}>
            <Touchable
              activeOpacity={0.88}
              onPress={() => router.replace("/profile/orders")}
              style={s.trackBtn}
            >
              <Text style={s.trackBtnText}>Track My Order</Text>
            </Touchable>
            <Touchable
              activeOpacity={0.5}
              onPress={() => router.replace("/(tabs)")}
              style={s.continueBtn}
            >
              <Text style={s.continueBtnText}>Continue Shopping</Text>
              <icons.arrow_forward_ios
                width={exactScale(12)}
                height={exactScale(12)}
                fill="#374151"
              />
            </Touchable>
          </Animated.View>
        </ScrollView>
      </Animated.View>
    </View>
  );
};
