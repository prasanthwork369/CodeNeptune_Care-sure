import { useCartFloatingBannerAnimation } from "@/src/features/home/hooks/useCartFloatingBannerAnimation";
import {
  SmokePuff,
  useFlyToCartSafe,
  type FlyImage,
  type VisualCartImage,
} from "@/src/components/animations/flyToCart";
import { PILL_HEIGHT } from "@/src/components/navigation/LiquidTabBar.styles";
import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { useCart } from "@/src/features/cart/hooks/useCart";
import { tabBarVisible } from "@/src/store/tabBarVisibility";
import { useUIStore } from "@/src/store/uiStore";
import { exactScale } from "@/src/utils/exactScale";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import Animated, {
  runOnJS,
  useAnimatedReaction,
} from "react-native-reanimated";
import { CART_THUMB_SIZE, CartBannerThumbnail } from "./CartBannerThumbnail";
import { styles as s } from "./CartFloatingBanner.styles";

const AnimatedText = Animated.createAnimatedComponent(Text);

interface CartFloatingBannerProps {
  visible?: boolean;
  productName?: string;
  productForm?: string;
  onViewCart?: () => void;
  onInteractionChange?: (isInteracting: boolean) => void;
}

export const CartFloatingBanner = ({
  visible,
  productName,
  productForm,
  onViewCart,
  onInteractionChange,
}: CartFloatingBannerProps) => {
  const [isClearing, setIsClearing] = useState(false);
  const { totalItems: cartItems, cartLineCount, items, clearCart } = useCart();
  const flyCtx = useFlyToCartSafe();

  const totalItems = cartItems;
  const setTabBarVisible = useUIStore((st) => st.setTabBarVisible);
  const setUploadButtonCollapsed = useUIStore(
    (st) => st.setUploadButtonCollapsed,
  );
  const lastAddedItem =
    [...items].reverse().find((i) => i.image ?? i.metadata?.image) ??
    items[items.length - 1] ??
    null;

  const {
    isSlid,
    handleSnapBack,
    handleClosePress,
    bannerStyle,
    containerStyle,
    buttonAnimatedStyle,
    buttonTextAnimatedStyle,
    itemCountAnimatedStyle,
    hideAnimationDuration,
  } = useCartFloatingBannerAnimation({
    visible,
    totalItems,
    onInteractionChange,
  });

  // Memoize display values — no recalc on unrelated renders
  const displayTitle = useMemo(
    () => productName || lastAddedItem?.medicineName || "Your Medicine",
    [productName, lastAddedItem?.medicineName],
  );

  const displaySubtitle = useMemo(
    () => productForm || lastAddedItem?.dosageForm || "Tablet",
    [productForm, lastAddedItem?.dosageForm],
  );

  // ── Fly-to-cart destination ─────────────────────────────────────────────────
  const imageStackRef = useRef<View>(null);
  const { width: screenWidth } = useWindowDimensions();

  // The carousel also mounts duplicate banners off-screen; only report the visible one.
  const reportDestination = useCallback(() => {
    if (!flyCtx) return;
    imageStackRef.current?.measureInWindow((x, y, w, h) => {
      if (x >= 0 && x < screenWidth && y > 0) {
        flyCtx.setDestinationCoords({ x: x + w / 2, y: y + h / 2 });
      }
    });
  }, [flyCtx, screenWidth]);

  // The banner rides the tab bar's translate, so re-measure once that slide settles.
  useAnimatedReaction(
    () => tabBarVisible.value,
    (current, previous) => {
      const settled = current === 0 || current === 1;
      if (previous !== null && current !== previous && settled) {
        runOnJS(reportDestination)();
      }
    },
    [reportDestination],
  );

  // Sourced from the provider
  const visualCartImages = flyCtx?.visualCartImages ?? [];
  const hasMultipleImages = visualCartImages.length > 1;
  const backThumb = hasMultipleImages
    ? visualCartImages[visualCartImages.length - 2]
    : null;
  const frontThumb = visualCartImages[visualCartImages.length - 1] ?? null;

  const isExiting = (t: VisualCartImage | null) =>
    !!t && (t.isRemoving || t.isBehindRemoving);
  const frontOffset = hasMultipleImages ? exactScale(8) : 0;
  const puffOffsetLeft = isExiting(frontThumb)
    ? frontOffset
    : isExiting(backThumb)
      ? 0
      : null;

  const handleBannerPress = useCallback(() => {
    if (isSlid.value) {
      handleSnapBack();
    } else {
      onViewCart?.();
    }
  }, [isSlid, handleSnapBack, onViewCart]);

  const handleRemove = useCallback(async () => {
    setIsClearing(true);
    onInteractionChange?.(true);
    try {
      await clearCart();
      await new Promise((resolve) =>
        setTimeout(resolve, hideAnimationDuration),
      );
      setTabBarVisible(true);
      setUploadButtonCollapsed(false);
    } catch (error) {
      if (__DEV__) console.error("Failed to clear cart:", error);
    } finally {
      setIsClearing(false);
      onInteractionChange?.(false);
    }
  }, [
    clearCart,
    onInteractionChange,
    hideAnimationDuration,
    setTabBarVisible,
    setUploadButtonCollapsed,
  ]);

  return (
    <Animated.View style={containerStyle}>
      <View style={s.pillShadowWrap}>
        <View style={s.pillBorderWrap}>
          <Animated.View
            style={[bannerStyle, { flexDirection: "row", width: "100%" }]}
          >
            <Touchable
              activeOpacity={1}
              onPress={handleBannerPress}
              style={{ width: "100%" }}
            >
              <View style={s.bannerInnerRow}>
                <View
                  ref={imageStackRef}
                  collapsable={false}
                  onLayout={reportDestination}
                  style={[
                    s.imageStack,
                    {
                      width: hasMultipleImages ? exactScale(52) : exactScale(44),
                    },
                  ]}
                >
                  {hasMultipleImages && backThumb && (
                    <CartBannerThumbnail
                      key={backThumb.id}
                      image={backThumb.image}
                      isPending={backThumb.isPending}
                      isRemoving={backThumb.isRemoving}
                      isBehindRemoving={backThumb.isBehindRemoving}
                      absolute
                    />
                  )}
                  <CartBannerThumbnail
                    key={frontThumb?.id ?? "front-stacked"}
                    image={
                      frontThumb?.image ??
                      lastAddedItem?.image ??
                      (lastAddedItem?.metadata?.image as FlyImage)
                    }
                    isPending={frontThumb?.isPending}
                    isRemoving={frontThumb?.isRemoving}
                    isBehindRemoving={frontThumb?.isBehindRemoving}
                    absolute={hasMultipleImages}
                    offsetLeft={frontOffset}
                  />
                </View>

                {/* minWidth 0 lets the flex child shrink */}
                <View style={s.titleSubCol}>
                  <Text
                    numberOfLines={1}
                    style={s.titleText}
                  >
                    {displayTitle}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={s.subtitleText}
                  >
                    {displaySubtitle}
                  </Text>
                </View>

                <View style={s.actionsRow}>
                  <Touchable activeOpacity={0.9} onPress={onViewCart}>
                    <Animated.View style={[s.viewCartBtn, buttonAnimatedStyle]}>
                      <AnimatedText
                        style={[
                          s.viewCartText,
                          buttonTextAnimatedStyle,
                        ]}
                      >
                        View Cart
                      </AnimatedText>
                      <AnimatedText
                        style={[
                          s.viewCartItemCount,
                          itemCountAnimatedStyle,
                        ]}
                      >
                        {/* Unique cart lines, not summed quantity — matches the cart badge. */}
                        {cartLineCount} {cartLineCount === 1 ? "item" : "items"}
                      </AnimatedText>
                    </Animated.View>
                  </Touchable>

                  <Touchable
                    onPress={handleClosePress}
                    activeOpacity={0.7}
                    style={s.closeBtn}
                  >
                    <icons.close_small
                      width={exactScale(12)}
                      height={exactScale(12)}
                      fill="#6A6A6A"
                    />
                  </Touchable>
                </View>
              </View>
            </Touchable>

            <Touchable
              onPress={handleRemove}
              activeOpacity={0.7}
              disabled={isClearing}
              style={s.removeBtn}
            >
              {isClearing ? (
                <ActivityIndicator size="small" color="#0F7635" />
              ) : (
                <Text style={s.removeBtnText}>
                  Remove
                </Text>
              )}
            </Touchable>
          </Animated.View>
        </View>
      </View>

      {/* Outside the pill's overflow:hidden */}
      {puffOffsetLeft !== null && (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: 1 + exactScale(12) + puffOffsetLeft,
            top: 1 + PILL_HEIGHT / 2 - CART_THUMB_SIZE / 2,
            width: CART_THUMB_SIZE,
            height: CART_THUMB_SIZE,
          }}
        >
          <SmokePuff
            active
            center={CART_THUMB_SIZE / 2}
            firstColor="#22C55E"
            secondColor="#86EFAC"
          />
        </View>
      )}
    </Animated.View>
  );
};
