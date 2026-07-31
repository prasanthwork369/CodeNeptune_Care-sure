import { PRESCRIPTION_STATUS } from "@/src/constants/prescription-status";
import { useCart } from "@/src/hooks/queries/useCart";
import { usePrescriptionBanner } from "@/src/hooks/ui/usePrescriptionBanner";
import { useNav } from "@/src/hooks/useNav";
import { useUIStore } from "@/src/store/uiStore";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ScrollView, useWindowDimensions, View } from "react-native";
import {
  BAR_HEIGHT,
  PILL_HEIGHT,
} from "@/src/components/navigation/LiquidTabBar.styles";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  Easing,
  interpolateColor,
  SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
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

export const FloatingBannersCarousel = ({
  isFocused = true,
}: {
  isFocused?: boolean;
}) => {
  const router = useNav();
  const adjustedBottom = useAdjustedBottomInset();
  const extraGap = exactScale(6);
  const { width } = useWindowDimensions();
  const { totalItems } = useCart();
  const isTabBarVisible = useUIStore((s) => s.isTabBarVisible);
  const { latestPrescription, hasPendingPrescription, dismissBanner } =
    usePrescriptionBanner();
  const isRxFromCartFlow = useUIStore((s) => s.isRxFromCartFlow);
  // Pause autoplay while the home feed is scrolling. Read from the store here
  // (rather than via a prop) so scroll toggles don't re-render the whole feed.
  const isFeedScrolling = useUIStore((s) => s.isFeedScrolling);
  const focused = isFocused && !isFeedScrolling;

  const [isCartInteracting, setIsCartInteracting] = useState(false);
  // Keep the banner mounted through a Remove tap (totalItems hits 0 before
  // the close animation finishes) so it can hide smoothly instead of
  // snapping out instantly.
  const isCartActive = totalItems > 0 || isCartInteracting;
  const isRxActive = hasPendingPrescription;
  const bothActive = isCartActive && isRxActive;
  const [activeBannerIndex, setActiveBannerIndex] = useState(
    bothActive ? 1 : 0,
  );
  const scrollViewRef = useRef<ScrollView>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentScrollX = useRef(bothActive ? width : 0);

  // Tab bar vertical transition anim
  const translateY = useSharedValue(0);
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
    if (bothActive && focused && !isCartInteracting) {
      timerRef.current = setInterval(() => {
        setActiveBannerIndex((prev) => (prev === 2 ? 1 : 2));
      }, 4000);
    }
  }, [bothActive, focused, isCartInteracting, stopAutoplay]);

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

  useEffect(() => {
    translateY.value = withTiming(isTabBarVisible ? 0 : exactScale(73), {
      duration: 300,
      easing: Easing.inOut(Easing.ease),
    });
  }, [isTabBarVisible, translateY]);

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

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const dotsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isTabBarVisible ? 1 : 0, {
      duration: 250,
      easing: Easing.inOut(Easing.ease),
    }),
    transform: [
      {
        translateY: withTiming(isTabBarVisible ? 0 : 10, {
          duration: 250,
          easing: Easing.inOut(Easing.ease),
        }),
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
  // within BAR_HEIGHT = (BAR_HEIGHT + PILL_HEIGHT) / 2.
  // Derived from actual style constants so it stays in sync automatically.
  const TAB_BAR_HEIGHT =
    (BAR_HEIGHT + PILL_HEIGHT) / 2 + adjustedBottom + extraGap;

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
              ref={scrollViewRef as any}
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
                  zIndex: 20,
                  elevation: 7,
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
