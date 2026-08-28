/* eslint-disable react-hooks/immutability, react-hooks/set-state-in-effect */
import { PRESCRIPTION_STATUS } from "@/src/features/prescription/constants/prescription-status";
import { useCartRead } from "@/src/features/cart/hooks/useCartRead";
import { usePrescriptionBanner } from "@/src/features/home/hooks/usePrescriptionBanner";
import { useNav } from "@/src/hooks/useNav";
import { useUIStore } from "@/src/store/uiStore";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  ScrollView,
  useWindowDimensions,
  View,
} from "react-native";
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
import { getPrescriptionImageUrls } from "@/src/features/prescription/utils/prescription";
import { exactScale } from "@/src/utils/exactScale";
import { styles as s } from "./FloatingBannersCarousel.styles";

interface DotProps {
  index: number;
  progress: SharedValue<number>;
  total: number;
}

// Room reserved below the banner for its 20px boxShadow.
const SHADOW_ROOM = exactScale(24);

// How far the banners drop when the tab bar hides.
const BANNER_HIDE_OFFSET = exactScale(73);

// Sits strictly behind the banner with an overhang extending through the Android system navigation bar.
const BannerBottomFade = ({ extraBottom = 0 }: { extraBottom?: number }) => (
  <LinearGradient
    colors={[
      "rgba(255,255,255,0)",
      "rgba(255,255,255,0.75)",
      "#FFFFFF",
      "#FFFFFF",
    ]}
    locations={[0, 0.35, 0.65, 1]}
    pointerEvents="none"
    style={[
      s.bottomFade,
      {
        bottom: -exactScale(120) + extraBottom,
      },
    ]}
  />
);

const Dot: React.FC<DotProps> = React.memo(({ index, progress, total }) => {
  const style = useAnimatedStyle(() => {
    const shifted = progress.value - 1;
    const norm = ((shifted % total) + total) % total;
    let dist = Math.abs(norm - index);
    if (dist > total / 2) {
      dist = total - dist;
    }

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
        s.dotBase,
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
  const { totalItems } = useCartRead();
  const { latestPrescription, hasPendingPrescription, dismissBanner } =
    usePrescriptionBanner();
  const isRxFromCartFlow = useUIStore((st) => st.isRxFromCartFlow);
  const isFeedScrolling = useUIStore((st) => st.isFeedScrolling);
  const isHomeFocused = useUIStore((st) => st.isHomeFocused);
  const focused = isHomeFocused && !isFeedScrolling;
  const isAppForeground = useIsAppForeground();

  const [isCartInteracting, setIsCartInteracting] = useState(false);
  const visualCartCount = useFlyToCartSafe()?.visualCartCount ?? 0;
  const isCartActive =
    totalItems > 0 || visualCartCount > 0 || isCartInteracting;
  const isRxActive = hasPendingPrescription;
  const bothActive = isCartActive && isRxActive;
  const [activeBannerIndex, setActiveBannerIndex] = useState(
    bothActive ? 1 : 0,
  );
  const scrollViewRef = useRef<ScrollView>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isInteractingRef = useRef(false);
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
    if (
      bothActive &&
      focused &&
      !isCartInteracting &&
      isAppForeground &&
      !isInteractingRef.current
    ) {
      timerRef.current = setInterval(() => {
        if (isInteractingRef.current) return;
        setActiveBannerIndex((prev) => (prev === 2 ? 1 : 2));
      }, 4000);
    }
  }, [bothActive, focused, isCartInteracting, isAppForeground, stopAutoplay]);

  // Initial placement when active banner count changes
  useEffect(() => {
    if (bothActive) {
      setActiveBannerIndex(1);
      currentScrollX.current = 1 * width;
      progress.value = 1;
      scrollViewRef.current?.scrollTo({ x: width, animated: false });
    } else {
      if (isCartActive) setActiveBannerIndex(0);
      else if (isRxActive) setActiveBannerIndex(1);
    }
  }, [bothActive, isCartActive, isRxActive, width, progress]);

  // Autoplay timer controller
  useEffect(() => {
    if (bothActive && focused && !isCartInteracting && isAppForeground) {
      startAutoplay();
    } else {
      stopAutoplay();
    }
    return () => stopAutoplay();
  }, [
    bothActive,
    focused,
    isCartInteracting,
    isAppForeground,
    startAutoplay,
    stopAutoplay,
  ]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      progress.value = event.contentOffset.x / width;
    },
  });

  useEffect(() => {
    if (isInteractingRef.current) return;
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
    router.push("/(commerce)/cart");
  };

  const handleRxPress = () => {
    if (!latestPrescription) return;

    if (latestPrescription.status === PRESCRIPTION_STATUS.CANCELLED) {
      router.push({
        pathname: "/(prescription)/prescription-viewer",
        params: {
          prescriptionId: latestPrescription.id,
          imageUrls: JSON.stringify(getPrescriptionImageUrls(latestPrescription)),
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
      if (latestPrescription.status === PRESCRIPTION_STATUS.NEW) {
        router.push({
          pathname: "/(prescription)/prescription-viewer",
          params: {
            prescriptionId: latestPrescription.id,
            imageUrls: JSON.stringify(getPrescriptionImageUrls(latestPrescription)),
            doctorName: latestPrescription.doctorName ?? "",
            patientName: latestPrescription.ocrData?.patientName ?? "",
            uploadedDate: latestPrescription.createdAt ?? "",
            source: "view_only",
          },
        });
        return;
      }
      router.push("/notifications");
    }
  };

  const handleScrollEnd = useCallback(
    (offsetX: number) => {
      isInteractingRef.current = false;
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
    },
    [width, progress, startAutoplay],
  );

  const handleScrollBeginDrag = useCallback(() => {
    isInteractingRef.current = true;
    stopAutoplay();
  }, [stopAutoplay]);

  const handleScrollEndDrag = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const hasVelocity = Math.abs(e.nativeEvent.velocity?.x ?? 0) > 0.01;
      if (!hasVelocity) {
        handleScrollEnd(e.nativeEvent.contentOffset.x);
      }
    },
    [handleScrollEnd],
  );

  const handleMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      handleScrollEnd(e.nativeEvent.contentOffset.x);
    },
    [handleScrollEnd],
  );

  if (!isCartActive && !isRxActive) return null;

  const TAB_BAR_HEIGHT = PILL_HEIGHT + adjustedBottom + extraGap;

  return (
    <>
      {bothActive ? (
        <Animated.View
          pointerEvents="box-none"
          style={[
            s.bothActiveCarouselWrap,
            {
              bottom: TAB_BAR_HEIGHT + exactScale(8) - SHADOW_ROOM,
              width: width,
              height: exactScale(90) + SHADOW_ROOM,
            },
            animatedContainerStyle,
          ]}
        >
          <BannerBottomFade extraBottom={SHADOW_ROOM} />
          {/* Slides Container */}
          <View
            pointerEvents="box-none"
            style={[
              s.slidesContainer,
              {
                height: exactScale(82) + SHADOW_ROOM,
              },
            ]}
          >
            <Animated.ScrollView
              ref={scrollViewRef as React.Ref<Animated.ScrollView>}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              bounces={false}
              scrollEventThrottle={16}
              onScroll={scrollHandler}
              onScrollBeginDrag={handleScrollBeginDrag}
              onScrollEndDrag={handleScrollEndDrag}
              onMomentumScrollEnd={handleMomentumScrollEnd}
              style={{ width: width, height: "100%" }}
              contentContainerStyle={{
                width: width * 4,
                height: "100%",
                flexDirection: "row",
              }}
            >
              {/* Index 0: Prescription (Dummy for loop) */}
              <View
                style={[
                  s.slideItem,
                  {
                    width: width,
                    paddingBottom: 1 + SHADOW_ROOM,
                  },
                ]}
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
                style={[
                  s.slideItem,
                  {
                    width: width,
                    paddingBottom: 1 + SHADOW_ROOM,
                  },
                ]}
              >
                <CartFloatingBanner
                  visible={true}
                  onViewCart={handleCartPress}
                  onInteractionChange={setIsCartInteracting}
                />
              </View>

              {/* Index 2: Prescription (Real) */}
              <View
                style={[
                  s.slideItem,
                  {
                    width: width,
                    paddingBottom: 1 + SHADOW_ROOM,
                  },
                ]}
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
                style={[
                  s.slideItem,
                  {
                    width: width,
                    paddingBottom: 1 + SHADOW_ROOM,
                  },
                ]}
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
                s.dotsBadge,
                {
                  bottom: exactScale(3) + SHADOW_ROOM,
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
                s.singleBannerWrap,
                {
                  bottom: TAB_BAR_HEIGHT + exactScale(8),
                },
                animatedContainerStyle,
              ]}
            >
              <BannerBottomFade />
              <View pointerEvents="box-none" style={s.singleBannerInner}>
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
              </View>
            </Animated.View>
          )}

          {isCartActive && (
            <Animated.View
              pointerEvents="box-none"
              style={[
                s.singleBannerWrap,
                {
                  bottom: TAB_BAR_HEIGHT + exactScale(8),
                },
                animatedContainerStyle,
              ]}
            >
              <BannerBottomFade />
              <View pointerEvents="box-none" style={s.singleBannerInner}>
                <CartFloatingBanner
                  visible={isCartActive}
                  onViewCart={() => router.push("/(commerce)/cart")}
                  onInteractionChange={setIsCartInteracting}
                />
              </View>
            </Animated.View>
          )}
        </>
      )}
    </>
  );
};
