import { useCartFloatingBannerAnimation } from "@/src/features/home/hooks/useCartFloatingBannerAnimation";
import {
  SmokePuff,
  useFlyToCartSafe,
  type VisualCartImage,
} from "@/src/components/animations/flyToCart";
import { PILL_HEIGHT } from "@/src/components/navigation/LiquidTabBar.styles";
import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { useCart } from "@/src/features/cart/hooks/useCart";
import { tabBarVisible } from "@/src/store/tabBarVisibility";
import { useUIStore } from "@/src/store/uiStore";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { useCallback, useMemo, useRef, useState } from "react";
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

const AnimatedText = Animated.createAnimatedComponent(Text);

interface CartFloatingBannerProps {
  visible?: boolean;
  productName?: string;
  productForm?: string;
  onViewCart?: () => void;
  onInteractionChange?: (isInteracting: boolean) => void;
}

// Static styles outside component — never recreated
const BUTTON_STATIC = {
  backgroundColor: "#0F7635",
  borderRadius: exactScale(28),
  alignItems: "center" as const,
  justifyContent: "center" as const,
};

export const CartFloatingBanner = ({
  visible,
  productName,
  productForm,
  onViewCart,
  onInteractionChange,
}: CartFloatingBannerProps) => {
  const [isClearing, setIsClearing] = useState(false);
  const { totalItems: cartItems, items, clearCart } = useCart();
  const flyCtx = useFlyToCartSafe();

  // cartMutations writes the cart query cache via setQueryData the instant
  // the server responds, so cartItems (the real total) is already reliable —
  // it does not trail behind visualCartCount, which depends on a slower,
  // async native measure() call. Taking Math.max of the two let any drift in
  // the optimistic counter permanently inflate the displayed number even
  // after the real cart (and the Cart page) settled on the correct total, so
  // the number here always trusts the real cart. Visibility (whether the
  // banner renders at all) is controlled separately via the `visible` prop
  // from the parent, which still uses visualCartCount for an instant show.
  const totalItems = cartItems;
  const setTabBarVisible = useUIStore((s) => s.setTabBarVisible);
  const setUploadButtonCollapsed = useUIStore(
    (s) => s.setUploadButtonCollapsed,
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

  // Sourced from the provider (not the cart) so the circles carry the
  // isRemoving/isPending flags that drive the puff and the fly landing.
  const visualCartImages = flyCtx?.visualCartImages ?? [];
  const backThumb =
    visualCartImages.length > 1
      ? visualCartImages[visualCartImages.length - 2]
      : null;
  const frontThumb = visualCartImages[visualCartImages.length - 1] ?? null;

  // Quantity says two circles but only one product has a thumbnail (e.g. the
  // same item bumped to qty 2) — repeat its image so the back slot reads as a
  // stack instead of sitting empty.
  const backImage = backThumb?.image ?? frontThumb?.image;

  // The pill clips its children, so the puff is drawn over it instead. Only one
  // thumbnail animates out at a time — find which slot it sits in.
  const isExiting = (t: VisualCartImage | null) =>
    !!t && (t.isRemoving || t.isBehindRemoving);
  const frontOffset = totalItems > 1 ? exactScale(8) : 0;
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
      // totalItems hitting 0 triggers the hook's hide animation; wait for it
      // to finish before letting the banner unmount.
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
      <View
        style={{
          // Lighter than the tab bar pill's 15% — the banner sits over content.
          boxShadow: "0px 0px 20px 0px #00000017",
          borderRadius: exactScale(999),
          backgroundColor: "white",
        }}
      >
        <View
          style={{
            borderRadius: exactScale(999),
            overflow: "hidden",
            backgroundColor: "white",
          }}
          className="border border-[#0000000D]"
        >
          <Animated.View
            style={[bannerStyle, { flexDirection: "row", width: "100%" }]}
          >
            <Touchable
              activeOpacity={1}
              onPress={handleBannerPress}
              style={{ width: "100%" }}
            >
              <View
                className="flex-row items-center bg-white"
                style={{
                  borderRadius: exactScale(999),
                  height: PILL_HEIGHT,
                  paddingHorizontal: exactScale(12),
                }}
              >
                <View
                  ref={imageStackRef}
                  collapsable={false}
                  onLayout={reportDestination}
                  className="justify-center"
                  style={{
                    width: totalItems > 1 ? exactScale(52) : exactScale(44),
                    height: exactScale(48),
                    marginRight: exactScale(12),
                  }}
                >
                  {/* Mirrors the category banner's ThumbnailItem: a thumbnail
                      in flight stays hidden and reveals itself on landing. */}
                  {totalItems > 1 && (
                    <CartBannerThumbnail
                      key={backThumb?.id ?? "back-stacked"}
                      image={backImage}
                      isPending={backThumb?.isPending}
                      isRemoving={backThumb?.isRemoving}
                      isBehindRemoving={backThumb?.isBehindRemoving}
                      absolute
                    />
                  )}
                  <CartBannerThumbnail
                    key={frontThumb?.id ?? "front-stacked"}
                    image={frontThumb?.image}
                    isPending={frontThumb?.isPending}
                    isRemoving={frontThumb?.isRemoving}
                    isBehindRemoving={frontThumb?.isBehindRemoving}
                    absolute={totalItems > 1}
                    offsetLeft={frontOffset}
                  />
                </View>

                {/* minWidth 0 lets the flex child actually shrink — without it a
                    long medicine name pushes into the View Cart button. */}
                <View
                  className="flex-1 justify-center"
                  style={{ minWidth: 0, marginRight: exactScale(8) }}
                >
                  <Text
                    className="font-inter-bold text-[#1A1C1E]"
                    numberOfLines={1}
                    style={{
                      fontSize: moderateScale(14),
                      lineHeight: moderateScale(18),
                    }}
                  >
                    {displayTitle}
                  </Text>
                  <Text
                    className="font-inter-bold text-[#1A1C1E]"
                    numberOfLines={1}
                    style={{
                      fontSize: moderateScale(14),
                      lineHeight: moderateScale(18),
                    }}
                  >
                    {displaySubtitle}
                  </Text>
                </View>

                <View
                  className="flex-row items-center"
                  style={{ columnGap: exactScale(8), flexShrink: 0 }}
                >
                  <Touchable activeOpacity={0.9} onPress={onViewCart}>
                    <Animated.View style={[BUTTON_STATIC, buttonAnimatedStyle]}>
                      <AnimatedText
                        style={[
                          { color: "white", fontWeight: "700" },
                          buttonTextAnimatedStyle,
                        ]}
                      >
                        View Cart
                      </AnimatedText>
                      <AnimatedText
                        style={[
                          { color: "white", fontWeight: "600" },
                          itemCountAnimatedStyle,
                        ]}
                      >
                        {totalItems} {totalItems === 1 ? "item" : "items"}
                      </AnimatedText>
                    </Animated.View>
                  </Touchable>

                  <Touchable
                    onPress={handleClosePress}
                    activeOpacity={0.7}
                    className="rounded-full bg-[#F3F4F6] items-center justify-center"
                    style={{ width: exactScale(30), height: exactScale(30) }}
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
              style={{
                position: "absolute",
                right: -exactScale(90),
                width: exactScale(90),
                height: "100%",
                backgroundColor: "#ECFDF5",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: exactScale(999),
              }}
            >
              {isClearing ? (
                <ActivityIndicator size="small" color="#0F7635" />
              ) : (
                <Text
                  className="font-inter-semibold text-[#0F7635]"
                  style={{ fontSize: moderateScale(14) }}
                >
                  Remove
                </Text>
              )}
            </Touchable>
          </Animated.View>
        </View>
      </View>

      {/* Outside the pill's overflow:hidden, so the burst isn't clipped away.
          Offsets mirror the thumbnail's: 1px border + the row's 12px padding. */}
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
            secondColor="#94A3B8"
          />
        </View>
      )}
    </Animated.View>
  );
};
