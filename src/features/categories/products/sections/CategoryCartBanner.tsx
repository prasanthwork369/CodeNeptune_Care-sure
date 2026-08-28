import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import {
  useFlyToCartSafe,
  ThumbnailItem,
  AnimatedCount,
} from "@/src/components/animations/flyToCart";
import { useCart } from "@/src/features/cart/hooks/useCart";
import React, { useEffect, useRef } from "react";
import { Text, View } from "react-native";
import { exactScale } from "@/src/utils/exactScale";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withDelay,
  withSpring,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { styles as s } from "./CategoryCartBanner.styles";

interface CategoryCartBannerProps {
  onPress?: () => void;
}

// Gentle spring for the pill's expand/collapse width
const WIDTH_SPRING = { damping: 20, stiffness: 140, mass: 0.7 } as const;

export const CategoryCartBanner: React.FC<CategoryCartBannerProps> = ({
  onPress,
}) => {
  const ctx = useFlyToCartSafe();

  // Expand to the original designed pill width (centered)
  const PILL_W = exactScale(250);

  const { cartLineCount } = useCart();
  const visualCartCount = ctx?.visualCartCount ?? 0;
  const visualCartImages = ctx?.visualCartImages ?? [];
  const bounceSharedValue = ctx?.bounceSharedValue ?? null;
  const widthExpansion = ctx?.widthExpansion ?? null;

  // ── Animated values ─────────────────────────────────────────────────────────
  const opacity = useSharedValue(0);
  const bannerWidth = useSharedValue(exactScale(60)); // starts as circle (60px)
  const textOpacity = useSharedValue(0);
  const chevronOpacity = useSharedValue(0);

  const wasVisible = useRef(false);
  const bannerRef = useRef<View>(null);
  const expansionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Animation state machine ─────────────────────────────────────────
  useEffect(() => {
    const visible = visualCartCount > 0;

    if (visible && !wasVisible.current) {
      wasVisible.current = true;
      bannerWidth.value = exactScale(60);
      textOpacity.value = 0;
      chevronOpacity.value = 0;
      opacity.value = withTiming(1, { duration: 160 });

      if (expansionTimer.current) clearTimeout(expansionTimer.current);
      if (resetTimer.current) clearTimeout(resetTimer.current);
      expansionTimer.current = setTimeout(() => {
        bannerWidth.value = withSpring(PILL_W, WIDTH_SPRING);
        textOpacity.value = withDelay(240, withTiming(1, { duration: 200 }));
        chevronOpacity.value = withDelay(330, withTiming(1, { duration: 180 }));
      }, 950);
    } else if (!visible && wasVisible.current) {
      wasVisible.current = false;
      if (expansionTimer.current) clearTimeout(expansionTimer.current);

      chevronOpacity.value = withTiming(0, { duration: 140 });
      textOpacity.value = withTiming(0, { duration: 180 });

      bannerWidth.value = withDelay(160, withSpring(exactScale(60), WIDTH_SPRING));
      opacity.value = withDelay(480, withTiming(0, { duration: 180 }));

      if (resetTimer.current) clearTimeout(resetTimer.current);
      resetTimer.current = setTimeout(() => {
        bannerWidth.value = exactScale(60);
        textOpacity.value = 0;
        chevronOpacity.value = 0;
      }, 700);
    }
  }, [visualCartCount, PILL_W, bannerWidth, chevronOpacity, opacity, textOpacity]);

  useEffect(
    () => () => {
      if (expansionTimer.current) clearTimeout(expansionTimer.current);
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    [],
  );

  // ── Destination coords for fly animation ────────────────────────────────────
  useEffect(() => {
    if (visualCartCount > 0 && ctx) {
      const t = setTimeout(() => {
        bannerRef.current?.measureInWindow((x, y, w, h) => {
          if (x >= 0 && y > 0) {
            const destX = w <= 70 ? x + w / 2 : x + 40;
            ctx.setDestinationCoords({ x: destX, y: y + h / 2 });
          }
        });
      }, 480);
      return () => clearTimeout(t);
    }
  }, [visualCartCount, ctx]);

  const handleLayout = React.useCallback(() => {
    if (!ctx) return;
    bannerRef.current?.measureInWindow((x, y, w, h) => {
      if (x >= 0 && y > 0) {
        const destX = w <= 70 ? x + w / 2 : x + 40;
        ctx.setDestinationCoords({ x: destX, y: y + h / 2 });
      }
    });
  }, [ctx]);

  // ── Animated styles ──────────────────────────────────────────────────────────
  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const pillStyle = useAnimatedStyle(() => ({
    width:
      bannerWidth.value +
      (widthExpansion
        ? interpolate(
            widthExpansion.value,
            [0, 18],
            [0, 6],
            Extrapolation.CLAMP,
          )
        : 0),
    transform: [{ scale: bounceSharedValue ? bounceSharedValue.value : 1 }],
  }));

  const textStyle = useAnimatedStyle(() => ({ opacity: textOpacity.value }));
  const chevronStyle = useAnimatedStyle(() => ({
    opacity: chevronOpacity.value,
  }));

  return (
    <Animated.View
      style={[
        containerStyle,
        s.container,
      ]}
    >
      <Animated.View
        ref={bannerRef}
        onLayout={handleLayout}
        style={[
          pillStyle,
          s.pill,
        ]}
      >
        <Touchable
          activeOpacity={1}
          onPress={onPress}
          style={s.touchable}
        >
          {/* Thumbnails */}
          <View style={s.thumbnailRow}>
            {visualCartImages.length > 0 ? (
              visualCartImages.map((item, index) => (
                <ThumbnailItem
                  key={item.id}
                  imgUrl={item.image}
                  index={index}
                  isPending={item.isPending}
                  isRemoving={item.isRemoving}
                  isBehindRemoving={item.isBehindRemoving}
                />
              ))
            ) : visualCartCount > 0 ? (
              <View style={s.fallbackPlaceholderBox}>
                <icons.placeholder width={exactScale(20)} height={exactScale(20)} />
              </View>
            ) : null}
          </View>

          {/* "View cart" + count */}
          <Animated.View
            style={[
              s.textCol,
              textStyle,
            ]}
          >
            <Text style={s.viewCartText}>
              View cart
            </Text>
            <AnimatedCount count={cartLineCount} />
          </Animated.View>

          {/* Chevron */}
          <Animated.View
            style={[
              chevronStyle,
              s.chevronBox,
            ]}
          >
            <icons.arrow_forward_ios_white width={exactScale(12)} height={exactScale(12)} />
          </Animated.View>
        </Touchable>
      </Animated.View>
    </Animated.View>
  );
};
CategoryCartBanner.displayName = "CategoryCartBanner";
