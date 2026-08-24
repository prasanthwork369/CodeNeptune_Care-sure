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
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withDelay,
  withSpring,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";

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
  const PILL_W = 250;

  // visualCartCount only drives the fly-animation timing (circle → pill
  // expansion) — the displayed number always trusts the real cart total,
  // same as CartFloatingBanner, so it can't drift or get stuck.
  const { totalItems } = useCart();
  const visualCartCount = ctx?.visualCartCount ?? 0;
  const visualCartImages = ctx?.visualCartImages ?? [];
  const bounceSharedValue = ctx?.bounceSharedValue ?? null;
  const widthExpansion = ctx?.widthExpansion ?? null;

  // ── Animated values ─────────────────────────────────────────────────────────
  const opacity = useSharedValue(0);
  const bannerWidth = useSharedValue(60); // starts as circle (60px)
  const textOpacity = useSharedValue(0);
  const chevronOpacity = useSharedValue(0);

  // Only the most recently added item's thumbnail shows while the banner
  // is still a circle; the full stack appears once it expands to a pill.
  const [isExpanded, setIsExpanded] = React.useState(false);

  const wasVisible = useRef(false);
  const bannerRef = useRef<View>(null);
  const expansionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Blinkit animation state machine ─────────────────────────────────────────
  useEffect(() => {
    const visible = visualCartCount > 0;

    if (visible && !wasVisible.current) {
      // ── FIRST ITEM ADDED ────────────────────────────────────────────────────
      // Step 1: appear immediately as a circle (fly is in the air)
      wasVisible.current = true;
      bannerWidth.value = 60;
      textOpacity.value = 0;
      chevronOpacity.value = 0;
      setIsExpanded(false);
      opacity.value = withTiming(1, { duration: 160 });

      // Step 2: fly lands at 750ms → image visible in circle
      // Step 3: after 200ms pause (user sees image in circle), expand to pill
      if (expansionTimer.current) clearTimeout(expansionTimer.current);
      // Clear a pending reset from a just-reversed removal, or it fires mid-expansion and collapses the banner.
      if (resetTimer.current) clearTimeout(resetTimer.current);
      expansionTimer.current = setTimeout(() => {
        bannerWidth.value = withSpring(PILL_W, WIDTH_SPRING);
        setIsExpanded(true);
        // Step 4: text fades in mid-expansion
        textOpacity.value = withDelay(240, withTiming(1, { duration: 200 }));
        // Step 5: chevron fades in last
        chevronOpacity.value = withDelay(330, withTiming(1, { duration: 180 }));
      }, 950); // 750ms fly + 200ms pause to see image in circle before expanding
    } else if (!visible && wasVisible.current) {
      // ── CART EMPTIED — reverse of expansion (pill → circle → gone) ──────────
      wasVisible.current = false;
      if (expansionTimer.current) clearTimeout(expansionTimer.current);

      // Step 1: chevron + text fade out immediately
      chevronOpacity.value = withTiming(0, { duration: 140 });
      textOpacity.value = withTiming(0, { duration: 180 });

      // Step 2: after text gone, shrink width back to circle
      bannerWidth.value = withDelay(160, withSpring(60, WIDTH_SPRING));

      // Step 3: after shrink, fade the circle out
      opacity.value = withDelay(480, withTiming(0, { duration: 180 }));

      // Silently reset so next first-add replays circle→pill
      if (resetTimer.current) clearTimeout(resetTimer.current);
      resetTimer.current = setTimeout(() => {
        bannerWidth.value = 60;
        textOpacity.value = 0;
        chevronOpacity.value = 0;
        setIsExpanded(false);
      }, 700);
    }
  }, [visualCartCount, PILL_W]);

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
            // Circle (60px): drop to center. Full pill: drop to thumbnail slot.
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

  // Width: main expansion + subtle pulse on each subsequent add
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
        { width: "100%", alignItems: "center", justifyContent: "center" },
      ]}
    >
      <Animated.View
        ref={bannerRef}
        onLayout={handleLayout}
        style={[
          pillStyle,
          {
            height: 60,
            backgroundColor: "#0F7635",
            borderRadius: 999,
            overflow: "hidden",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.22,
            shadowRadius: 8,
            elevation: 6,
          },
        ]}
      >
        <Touchable
          activeOpacity={0.7}
          onPress={onPress}
          style={{
            width: "100%",
            height: "100%",
            flexDirection: "row",
            alignItems: "center",
            paddingLeft: exactScale(12),
            paddingRight: exactScale(16),
          }}
        >
          {/* Thumbnails — visible from the moment circle appears */}
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {visualCartImages.length > 0 ? (
              (isExpanded ? visualCartImages : visualCartImages.slice(-1)).map(
                (item, index) => (
                  <ThumbnailItem
                    key={item.id}
                    imgUrl={item.image}
                    index={index}
                    isPending={item.isPending}
                    isRemoving={item.isRemoving}
                    isBehindRemoving={item.isBehindRemoving}
                  />
                ),
              )
            ) : visualCartCount > 0 ? (
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: "#fff",
                  borderWidth: 2,
                  borderColor: "#fff",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <icons.placeholder width={20} height={20} />
              </View>
            ) : null}
          </View>

          {/* "View cart" + count — fade in mid-expansion */}
          <Animated.View
            style={[
              { flex: 1, marginLeft: exactScale(10), justifyContent: "center" },
              textStyle,
            ]}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: moderateScale(14.5),
                fontWeight: "700",
                lineHeight: moderateScale(18),
              }}
            >
              View cart
            </Text>
            <AnimatedCount count={totalItems} />
          </Animated.View>

          {/* Chevron — fades in last */}
          <Animated.View
            style={[
              chevronStyle,
              {
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: "rgba(255,255,255,0.2)",
                alignItems: "center",
                justifyContent: "center",
              },
            ]}
          >
            <icons.arrow_forward_ios_white width={12} height={12} />
          </Animated.View>
        </Touchable>
      </Animated.View>
    </Animated.View>
  );
};
