import { PRESCRIPTION_STATUS } from "@/src/constants/prescription-status";
import { useCart } from "@/src/hooks/queries/useCart";
import { usePrescriptionBanner } from "@/src/hooks/ui/usePrescriptionBanner";
import { useNav } from "@/src/hooks/useNav";
import { useUIStore } from "@/src/store/uiStore";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ScrollView, useWindowDimensions, View } from "react-native";
import { PILL_HEIGHT } from "@/src/components/navigation/LiquidTabBar.styles";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useFlyToCartSafe } from "@/src/components/animations/flyToCart";
import { tabBarVisible } from "@/src/store/tabBarVisibility";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { useIsAppForeground } from "@/src/hooks/ui/useVisibleInterval";
import { CartFloatingBanner } from "./CartFloatingBanner";
import { PrescriptionFloatingBanner } from "./PrescriptionFloatingBanner";
import { exactScale } from "@/src/utils/exactScale";

interface DotProps {
  index: number;
  progress: SharedValue<number>;
  total: number;
}

// Room reserved below the banner for its 20px boxShadow. The carousel clips its
// slides (overflow + ScrollView), so without this the shadow is sliced off flat.
const SHADOW_ROOM = exactScale(24);

// How far the banners drop when the tab bar hides.
const BANNER_HIDE_OFFSET = exactScale(73);

// `extraBottom` lets a caller that shifted its own container back down cancel
// that shift here, so the fade lands on the same pixels either way.
const BannerFadeGradient = ({ extraBottom = 0 }: { extraBottom?: number }) => (
  <LinearGradient
    colors={["rgba(255,255,255,0)", "rgba(255,255,255,0.95)", "#FFFFFF"]}
    locations={[0.05, 0.3, 1]}
    pointerEvents="none"
    style={{
      position: "absolute",
      bottom: -exactScale(100) + extraBottom,
      left: 0,
      right: 0,
      height: exactScale(150),
      zIndex: -1,
    }}
  />
);

const Dot: React.FC<DotProps> = React.memo(({ index, progress, total }) => {
  const style = useAnimatedStyle(() => {
    // Shift progress by -1 since page index 1 is item A (Dot 0) and page index 2 is item B (Dot 1)
    const shifted = progress.value - 1;
    const norm = ((shifted % total) + total) % total;
    let dist = Math.abs(norm - index);
    if (dist > total / 2) {
      dist = total - dist;
    }

    // Interpolate color: solid white (active) to semi-transparent white (inactive)
    const colorVal = interpolateColor(
      dist,
      [0, 1],
      ["#FFFFFF", "rgba(255, 255, 255, 0.45)"],
    );

    return {
      backgroundColor: colorVal,
    };
  });
  return (
    <Animated.View
      style={[
        {
          width: exactScale(4),
          height: exactScale(4),
          borderRadius: exactScale(2),
        },
        style,
      ]}
    />
  );
});
Dot.displayName = "Dot";

export const FloatingBannersCarousel = () => {
  const router = useNav();
  const adjustedBottom = useAdjustedBottomInset();
  const extraGap = exactScale(6);
  const { width } = useWindowDimensions();
  const { totalItems } = useCart();
  const { latestPrescription, hasPendingPrescription, dismissBanner } =
    usePrescriptionBanner();
  const isRxFromCartFlow = useUIStore((s) => s.isRxFromCartFlow);
  // Pause autoplay while the home feed is scrolling or Home is blurred. Read
  // from the store here (rather than via props) so neither toggle re-renders
  // the whole feed.
  const isFeedScrolling = useUIStore((s) => s.isFeedScrolling);
  const isHomeFocused = useUIStore((s) => s.isHomeFocused);
  const focused = isHomeFocused && !isFeedScrolling;
  const isAppForeground = useIsAppForeground();

  const [isCartInteracting, setIsCartInteracting] = useState(false);
  // The cart mutation has no onMutate, so totalItems trails the server by a
  // round-trip. visualCartCount is bumped the moment the fly launches — without
  // it the banner would appear only after the flying image had already landed.
  const visualCartCount = useFlyToCartSafe()?.visualCartCount ?? 0;
  // Keep the banner mounted through a Remove tap (totalItems hits 0 before
  // the close animation finishes) so it can hide smoothly instead of
  // snapping out instantly.
  const isCartActive =
    totalItems > 0 || visualCartCount > 0 || isCartInteracting;
  const isRxActive = hasPendingPrescription;
  const bothActive = isCartActive && isRxActive;
  const [activeBannerIndex, setActiveBannerIndex] = useState(
    bothActive ? 1 : 0,
  );
  const scrollViewRef = useRef<ScrollView>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentScrollX = useRef(bothActive ? width : 0);

  // Horizontal transition progress for the carousel
  const progress = useSharedValue(0);

  const stopAutoplay = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startAutoplay = useCallback(() => {
    stopAutoplay();
    // Foreground check kept out of `focused` on purpose: folding it in there
    // would also reset the banner index on background and jump on resume.
    if (bothActive && focused && !isCartInteracting && isAppForeground) {
      timerRef.current = setInterval(() => {
        setActiveBannerIndex((prev) => (prev === 2 ? 1 : 2));
      }, 4000);
    }
  }, [bothActive, focused, isCartInteracting, isAppForeground, stopAutoplay]);

  // Auto-switch between banners when both are active
  useEffect(() => {
    if (bothActive && focused) {
      setActiveBannerIndex(1);
      currentScrollX.current = 1 * width;
      progress.value = 1;
      scrollViewRef.current?.scrollTo({ x: width, animated: false });
      startAutoplay();
    } else {
      stopAutoplay();
      if (isCartActive) setActiveBannerIndex(0);
      else if (isRxActive) setActiveBannerIndex(1);
    }
    return () => stopAutoplay();
  }, [
    bothActive,
    isCartActive,
    isRxActive,
    width,
    focused,
    progress,
    startAutoplay,
    stopAutoplay,
  ]);

  // Pause autoplay when user is interacting (revealing or tapping Remove)
  useEffect(() => {
    if (isCartInteracting) {
      stopAutoplay();
    } else {
      startAutoplay();
    }
    return () => stopAutoplay();
  }, [isCartInteracting, startAutoplay, stopAutoplay]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      progress.value = event.contentOffset.x / width;
    },
  });

  useEffect(() => {
    if (bothActive) {
      const targetX = activeBannerIndex * width;
      if (Math.abs(currentScrollX.current - targetX) > 5) {
        scrollViewRef.current?.scrollTo({
          x: targetX,
          animated: true,
        });
        currentScrollX.current = targetX;
      }
    } else {
      progress.value = 0;
      currentScrollX.current = 0;
    }
  }, [activeBannerIndex, bothActive, width, progress]);

  // Both ride the same shared value as the tab bar, so the banners travel on
  // the identical frame instead of chasing it through a store update.
  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          tabBarVisible.value,
          [0, 1],
          [BANNER_HIDE_OFFSET, 0],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  const dotsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: tabBarVisible.value,
    transform: [
      {
        translateY: interpolate(
          tabBarVisible.value,
          [0, 1],
          [10, 0],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  const handleCartPress = () => {
    router.push("/(stack)/cart");
  };

  const handleRxPress = () => {
    if (!latestPrescription) return;

    if (latestPrescription.status === PRESCRIPTION_STATUS.CANCELLED) {
      router.push({
        pathname: "/(prescription)/prescription-viewer",
        params: {
          prescriptionId: latestPrescription.id,
          imageUrls: JSON.stringify(latestPrescription.imageUrls ?? []),
          doctorName: latestPrescription.doctorName ?? "",
          patientName: latestPrescription.ocrData?.patientName ?? "",
          uploadedDate: latestPrescription.createdAt ?? "",
          source: "rejection",
        },
      });
      return;
    }

    if (
      latestPrescription.status === PRESCRIPTION_STATUS.APPROVED &&
      latestPrescription.prescriptionOrderId
    ) {
      router.push({
        pathname: "/(prescription)/medicine-comparison",
        params: {
          prescriptionOrderId: latestPrescription.prescriptionOrderId,
          prescriptionId: latestPrescription.id,
        },
      });
    } else if (!isRxFromCartFlow) {
      // Under review: open the prescription itself. The notifications list says
      // nothing about it and reads as the wrong screen entirely.
      if (latestPrescription.status === PRESCRIPTION_STATUS.NEW) {
        router.push({
          pathname: "/(prescription)/prescription-viewer",
          params: {
            prescriptionId: latestPrescription.id,
            imageUrls: JSON.stringify(latestPrescription.imageUrls ?? []),
            doctorName: latestPrescription.doctorName ?? "",
            patientName: latestPrescription.ocrData?.patientName ?? "",
            uploadedDate: latestPrescription.createdAt ?? "",
            // Nothing to action while it is still being reviewed.
            source: "view_only",
          },
        });
        return;
      }
      router.push("/notifications");
    }
  };

  const handleScrollEnd = (offsetX: number) => {
    let pageIndex = Math.round(offsetX / width);

    if (pageIndex === 0) {
      pageIndex = 2;
      scrollViewRef.current?.scrollTo({ x: 2 * width, animated: false });
      currentScrollX.current = 2 * width;
      progress.value = 2;
    } else if (pageIndex === 3) {
      pageIndex = 1;
      scrollViewRef.current?.scrollTo({ x: 1 * width, animated: false });
      currentScrollX.current = 1 * width;
      progress.value = 1;
    } else {
      currentScrollX.current = pageIndex * width;
    }

    setActiveBannerIndex(pageIndex);
    startAutoplay();
  };

  if (!isCartActive && !isRxActive) return null;

  // Distance from screen bottom to the top of the LiquidTabBar pill:
  // paddingBottom (adjustedBottom + extraGap) + vertical centering offset
  // Match the tab pill's bottom-aligned position.
  const TAB_BAR_HEIGHT = PILL_HEIGHT + adjustedBottom + extraGap;

  return (
    <>
      {bothActive ? (
        <Animated.View
          pointerEvents="box-none"
          style={[
            {
              position: "absolute",
              // Dropped by SHADOW_ROOM and grown by the same amount; each slide
              // adds it back as padding, so the banner lands where it always did.
              bottom: TAB_BAR_HEIGHT + exactScale(8) - SHADOW_ROOM,
              left: 0,
              width: width,
              height: exactScale(90) + SHADOW_ROOM,
              justifyContent: "flex-end",
              zIndex: 100,
            },
            animatedContainerStyle,
          ]}
        >
          <BannerFadeGradient extraBottom={SHADOW_ROOM} />
          {/* Slides Container */}
          <View
            pointerEvents="box-none"
            style={{
              width: "100%",
              height: exactScale(82) + SHADOW_ROOM,
              overflow: "hidden",
            }}
          >
            <Animated.ScrollView
              ref={scrollViewRef as React.Ref<Animated.ScrollView>}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              bounces={false}
              scrollEventThrottle={16}
              onScroll={scrollHandler}
              onScrollBeginDrag={() => stopAutoplay()}
              onScrollEndDrag={(e) => {
                handleScrollEnd(e.nativeEvent.contentOffset.x);
              }}
              onMomentumScrollEnd={(e) => {
                handleScrollEnd(e.nativeEvent.contentOffset.x);
              }}
              style={{ width: width, height: "100%" }}
              contentContainerStyle={{
                width: width * 4,
                height: "100%",
                flexDirection: "row",
              }}
            >
              {/* Index 0: Prescription (Dummy for loop) */}
              <View
                style={{
                  width: width,
                  height: "100%",
                  justifyContent: "flex-end",
                  paddingBottom: 1 + SHADOW_ROOM,
                }}
              >
                <PrescriptionFloatingBanner
                  visible={true}
                  status={latestPrescription?.status ?? PRESCRIPTION_STATUS.NEW}
                  onPress={handleRxPress}
                  onClose={
                    latestPrescription?.status === PRESCRIPTION_STATUS.CANCELLED
                      ? dismissBanner
                      : undefined
                  }
                />
              </View>

              {/* Index 1: Cart (Real) */}
              <View
                style={{
                  width: width,
                  height: "100%",
                  justifyContent: "flex-end",
                  paddingBottom: 1 + SHADOW_ROOM,
                }}
              >
                <CartFloatingBanner
                  visible={true}
                  onViewCart={handleCartPress}
                  onInteractionChange={setIsCartInteracting}
                />
              </View>

              {/* Index 2: Prescription (Real) */}
              <View
                style={{
                  width: width,
                  height: "100%",
                  justifyContent: "flex-end",
                  paddingBottom: 1 + SHADOW_ROOM,
                }}
              >
                <PrescriptionFloatingBanner
                  visible={true}
                  status={latestPrescription?.status ?? PRESCRIPTION_STATUS.NEW}
                  onPress={handleRxPress}
                  onClose={
                    latestPrescription?.status === PRESCRIPTION_STATUS.CANCELLED
                      ? dismissBanner
                      : undefined
                  }
                />
              </View>

              {/* Index 3: Cart (Dummy for loop) */}
              <View
                style={{
                  width: width,
                  height: "100%",
                  justifyContent: "flex-end",
                  paddingBottom: 1 + SHADOW_ROOM,
                }}
              >
                <CartFloatingBanner
                  visible={true}
                  onViewCart={handleCartPress}
                  onInteractionChange={setIsCartInteracting}
                />
              </View>
            </Animated.ScrollView>

            {/* Bottom Dots Indicator Badge */}
            <Animated.View
              style={[
                {
                  position: "absolute",
                  // Offset by the same room the slides gained, so the badge
                  // stays pinned to the banner instead of dropping with it.
                  bottom: exactScale(3) + SHADOW_ROOM,
                  alignSelf: "center",
                  height: exactScale(12),
                  paddingHorizontal: exactScale(6),
                  borderRadius: exactScale(7),
                  backgroundColor: "#9E9E9E",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: exactScale(4),
                  // zIndex alone handles stacking; elevation would also cast a
                  // dark Android drop shadow under the badge.
                  zIndex: 20,
                },
                dotsAnimatedStyle,
              ]}
            >
              <Dot index={0} progress={progress} total={2} />
              <Dot index={1} progress={progress} total={2} />
            </Animated.View>
          </View>
        </Animated.View>
      ) : (
        <>
          {isRxActive && (
            <Animated.View
              pointerEvents="box-none"
              style={[
                {
                  position: "absolute",
                  bottom: TAB_BAR_HEIGHT + exactScale(8),
                  left: 0,
                  right: 0,
                  zIndex: 50,
                },
                animatedContainerStyle,
              ]}
            >
              <BannerFadeGradient />
              <PrescriptionFloatingBanner
                visible={isRxActive}
                status={latestPrescription?.status ?? PRESCRIPTION_STATUS.NEW}
                onPress={handleRxPress}
                onClose={
                  latestPrescription?.status === PRESCRIPTION_STATUS.CANCELLED
                    ? dismissBanner
                    : undefined
                }
              />
            </Animated.View>
          )}

          {isCartActive && (
            <Animated.View
              pointerEvents="box-none"
              style={[
                {
                  position: "absolute",
                  bottom: TAB_BAR_HEIGHT + exactScale(8),
                  left: 0,
                  right: 0,
                  zIndex: 50,
                },
                animatedContainerStyle,
              ]}
            >
              <BannerFadeGradient />
              <CartFloatingBanner
                visible={isCartActive}
                onViewCart={() => router.push("/(stack)/cart")}
                onInteractionChange={setIsCartInteracting}
              />
            </Animated.View>
          )}
        </>
      )}
    </>
  );
};
