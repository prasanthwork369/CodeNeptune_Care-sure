import { AppButton } from "@/src/components/ui/AppButton";
import { Touchable } from "@/src/components/ui/Touchable";
import { OfferShine } from "@/src/components/ui/offerShine";
import { icons } from "@/src/constants/icons";
import { HOME_IMAGES } from "@/src/constants/images";
import { colors } from "@/src/constants/theme";
import { durations } from "@/src/theme";
import { useCartActions } from "@/src/features/cart/hooks/useCartActions";
import { RecommendedProduct, SearchedProduct } from "@/src/features/search/types";
import { moderateScale } from "@/src/utils/exactScale";
import { LinearGradient } from "expo-linear-gradient";
import { Image as ExpoImage } from "expo-image";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import ReAnimated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import Svg, { Line } from "react-native-svg";

interface ComparisonBoardProps {
  searched: SearchedProduct;
  recommended: RecommendedProduct;
  productId: string;
  medicineUuid?: string;
  slug?: string;
  requiresPrescription?: boolean;
}

// Add-button height must stay in sync with status slot so dashed dividers align
const ADD_BTN_HEIGHT = 50;
const ADD_BTN_PAD_TOP = 6;
const ADD_BTN_PAD_BOTTOM = 16;
const ADD_SECTION_HEIGHT =
  ADD_BTN_PAD_TOP + ADD_BTN_HEIGHT + ADD_BTN_PAD_BOTTOM;

const ComparisonDivider = () => (
  <View style={{ height: 1, marginVertical: 8 }}>
    <Svg width="100%" height="1">
      <Line
        x1="0"
        y1="0.5"
        x2="100%"
        y2="0.5"
        stroke="#E5E7EB"
        strokeWidth="1"
        strokeDasharray="2 4"
        strokeLinecap="round"
      />
    </Svg>
  </View>
);

export const ComparisonBoard: React.FC<ComparisonBoardProps> = ({
  searched,
  recommended,
  productId,
  medicineUuid,
  slug,
  requiresPrescription,
}) => {
  const { count, increment, decrement, animations, isPending } = useCartActions(
    {
      medicineId: medicineUuid ?? productId,
      variantId: recommended.variantId ?? null,
      productId,
      name: recommended.name,
      slug: slug,
      price: recommended.price,
      originalPrice: recommended.originalPrice,
      image: recommended.image,
      packSize: recommended.packSize,
      unit: recommended.unit,
      requiresPrescription: requiresPrescription,
    },
  );

  const { slideAnim, opacityAnim } = animations;

  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = screenWidth - 32;

  // Measure both cards separately to ensure neither name/manufacturer is clipped
  const [heights, setHeights] = useState({
    board: 380,
    searchedTop: 0,
    searchedBottom: 0,
    recommended: 0,
  });
  const { board: boardHeight, searchedTop: searchedTopHeight, searchedBottom: searchedBottomHeight, recommended: recommendedHeight } = heights;

  // Reset heights when product changes to recalculate layout measurements
  useEffect(() => {
    setHeights({ board: 380, searchedTop: 0, searchedBottom: 0, recommended: 0 });
  }, [productId]);

  // Recalculate board height based on measured card dimensions
  useEffect(() => {
    const searchedHeight =
      searchedTopHeight > 0 && searchedBottomHeight > 0
        ? searchedTopHeight + searchedBottomHeight + 12 + ADD_SECTION_HEIGHT
        : 0;
    const nextHeight = Math.ceil(
      Math.max(380, searchedHeight, recommendedHeight),
    );
    setHeights((current) =>
      current.board === nextHeight ? current : { ...current, board: nextHeight },
    );
  }, [recommendedHeight, searchedBottomHeight, searchedTopHeight]);

  // Drives half-width (0) to full-width (1) directly in drag gesture worklet; no JS round-trip
  const expandProgress = useSharedValue(0);
  // Saved at gesture start for relative onUpdate offset calculation
  const expandStart = useSharedValue(0);
  const touchStart = useSharedValue({ x: 0, y: 0 });
  const isExpanded = useSharedValue(false);
  const swapRotate = useRef(new Animated.Value(0)).current;

  // UI-thread opacity animation driven by drag; zero blink on worklet thread
  const swapBtnOpacity = useSharedValue(1);
  const swapBtnStyle = useAnimatedStyle(() => ({
    opacity: swapBtnOpacity.value,
  }));

  const animateSwapBtn = (toValue: number) => {
    swapBtnOpacity.value = withTiming(toValue, { duration: 180 });
  };

  const springConfig = {
    damping: 22,
    stiffness: 200,
    mass: 0.8,
    overshootClamping: true,
  };

  const handleSwap = () => {
    isExpanded.value = !isExpanded.value;

    animateSwapBtn(isExpanded.value ? 0 : 1);

    swapRotate.setValue(0);
    Animated.timing(swapRotate, {
      // 380ms was sluggish; durations.slow (300ms) matches app scale
      toValue: 1,
      duration: durations.slow,
      useNativeDriver: true,
    }).start();

    expandProgress.value = withSpring(isExpanded.value ? 1 : 0, springConfig);
  };

  // Matches PanResponder logic: claims only on 5px+ horizontal movement steeper than 1.5:1 (dx:dy ratio)
  const dragGesture = Gesture.Pan()
    .manualActivation(true)
    .onTouchesDown((e) => {
      "worklet";
      const t = e.allTouches[0];
      touchStart.value = { x: t.x, y: t.y };
    })
    .onTouchesMove((e, state) => {
      "worklet";
      const t = e.allTouches[0];
      const dx = t.x - touchStart.value.x;
      const dy = t.y - touchStart.value.y;
      if (Math.abs(dx) > 5 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        state.activate();
      } else if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) {
        state.fail();
      }
    })
    .onStart(() => {
      expandStart.value = expandProgress.value;
    })
    .onUpdate((e) => {
      let newVal = expandStart.value + -e.translationX / (cardWidth / 2);
      newVal = Math.min(1, Math.max(0, newVal));
      expandProgress.value = newVal;
      swapBtnOpacity.value = Math.max(0, 1 - newVal * 2.5);
    })
    .onEnd((e) => {
      const pos = expandProgress.value;
      // High velocity (200pt/s) overrides position; otherwise snap to nearest side
      const fastLeft = e.velocityX < -200;
      const fastRight = e.velocityX > 200;

      let expand: boolean;
      if (fastLeft) expand = true;
      else if (fastRight) expand = false;
      else expand = pos >= 0.5;

      expandProgress.value = withSpring(expand ? 1 : 0, springConfig);
      swapBtnOpacity.value = withTiming(expand ? 0 : 1, { duration: 180 });
      isExpanded.value = expand;
    })
    .onFinalize((_e, success) => {
      // If another gesture stole the touch, snap to nearest side (normal onEnd already handled the rest)
      if (success) return;
      const expand = expandProgress.value >= 0.5;
      expandProgress.value = withSpring(expand ? 1 : 0, springConfig);
      swapBtnOpacity.value = withTiming(expand ? 0 : 1, { duration: 180 });
      isExpanded.value = expand;
    });

  const swapRotateDeg = swapRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  // Constant instead of interpolation between two identical colors (no visual change needed)
  const recBgColor = "#FEFFF9";

  // Shell uses real left/width/paddingLeft to preserve rounded corners during drag; no children so cheap to resize
  const expandableSectionStyle = useAnimatedStyle(() => ({
    left: interpolate(expandProgress.value, [0, 1], [cardWidth / 2, 0]),
    width: interpolate(
      expandProgress.value,
      [0, 1],
      [cardWidth / 2, cardWidth],
    ),
    paddingLeft: interpolate(expandProgress.value, [0, 1], [4, 0]),
  }));

  // Fixed-width clip with translateX reveals content; avoids resizing heavy image/text tree on every frame
  const contentRevealStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: (cardWidth / 2 + 4) * (1 - expandProgress.value) },
    ],
  }));

  const rightColAnimatedStyle = useAnimatedStyle(() => ({
    opacity: expandProgress.value,
  }));

  // Subtract padding (4) and borders (2.5) from half-width so 12px right padding isn't clipped
  const leftColWidth = cardWidth / 2 - 6.5;

  return (
    <GestureDetector gesture={dragGesture}>
    <View
      className="mx-4  mb-2 overflow-hidden"
      style={{
        width: cardWidth,
        height: boardHeight,
        backgroundColor: "transparent",
      }}
    >
      {/* STATIC BASE LAYER — Left Column (You Searched) */}
      <View
        className="absolute top-0 left-0 bottom-0"
        style={{ width: cardWidth / 2, paddingRight: 4 }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "#FFFFFF",
            borderWidth: 1.25,
            borderColor: "#E5E7EB",
            borderRadius: 16,
            flexDirection: "column",
            justifyContent: "space-between",
            overflow: "hidden",
          }}
        >
          <View className="px-[12px] pt-[12px] pb-0 flex-1 flex-col justify-between">
            <View
              onLayout={(event) => {
                const h = Math.ceil(event.nativeEvent.layout.height);
                setHeights((prev) => (prev.searchedTop === h ? prev : { ...prev, searchedTop: h }));
              }}
            >
              <Text
                className="font-inter-bold text-[#4B5563] uppercase tracking-[0.8px] mb-2"
                style={{
                  height: 16,
                  lineHeight: moderateScale(16),
                  fontSize: moderateScale(11),
                }}
              >
                YOU SEARCHED
              </Text>
              <View className="bg-white border border-[#E5E7EB] rounded-[10px] h-[100px] mb-2 items-center justify-center overflow-hidden">
                {searched.image ? (
                  <ExpoImage
                    source={searched.image}
                    style={{ width: "85%", height: "85%" }}
                    contentFit="contain"
                    cachePolicy="memory-disk"
                  />
                ) : (
                  <icons.placeholder width="70%" height="70%" />
                )}
              </View>
              <Text
                className="font-inter-bold text-[#111827] mb-1"
                style={{
                  // 1.27x: product names carry descenders and Inter needs ~1.21x.
                  fontSize: moderateScale(15),
                  lineHeight: moderateScale(19),
                  // Always two lines' worth, so one- and two-line cards stay aligned.
                  minHeight: moderateScale(38),
                }}
                numberOfLines={2}
              >
                {searched.name}
              </Text>
              <Text
                className="font-inter-medium text-brand-subtext mb-[3px]"
                style={{
                  fontSize: moderateScale(12),
                  lineHeight: moderateScale(15),
                  minHeight: moderateScale(30),
                }}
                numberOfLines={2}
              >
                {searched.manufacturer}
              </Text>
              <Text
                className="font-inter text-brand-subtext"
                style={{
                  fontSize: moderateScale(11),
                  lineHeight: moderateScale(15),
                  minHeight: moderateScale(30),
                }}
                numberOfLines={2}
              >
                {searched.description}
              </Text>
            </View>

            <View
              style={{ marginTop: "auto" }}
              onLayout={(event) => {
                const h = Math.ceil(event.nativeEvent.layout.height);
                setHeights((prev) => (prev.searchedBottom === h ? prev : { ...prev, searchedBottom: h }));
              }}
            >
              {/* Spacer matching the savings badge height on the recommended card */}
              <View style={{ height: 30 }} />
              <ComparisonDivider />
              {/* Price Slot */}
              <View style={{ height: 28, justifyContent: "center" }}>
                <Text
                  className="font-inter-extrabold text-[#111827] mb-[2px]"
                  style={{ fontSize: moderateScale(20) }}
                >
                  ₹{searched.priceDisplay}
                </Text>
              </View>
              {/* Unit Price */}
              <Text
                className="font-inter-medium text-brand-subtext mb-0"
                style={{ fontSize: moderateScale(11) }}
              >
                ₹{searched.unitPriceDisplay}/ Unit
              </Text>
            </View>
          </View>

          {/* Status slot; same height as recommended card's add-button so dividers align */}
          <View
            className="px-[12px] pt-6"
            style={{ height: ADD_SECTION_HEIGHT, justifyContent: "center" }}
          >
            <Text
              className="font-inter-semibold text-[#EF4444]"
              style={{ fontSize: moderateScale(12) }}
            >
              {searched.status}
            </Text>
          </View>
        </View>
      </View>

      {/* Expandable shell (real left/width/paddingLeft, no children, cheap to resize) */}
      <ReAnimated.View
        style={[
          {
            position: "absolute",
            top: 0,
            bottom: 0,
            backgroundColor: "transparent",
            overflow: "hidden",
            zIndex: 10,
          },
          expandableSectionStyle,
        ]}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: recBgColor,
            borderWidth: 1.25,
            borderColor: "#DBF6A080",
            borderRadius: 16,
          }}
        >
          {/* Add button lives on animated shell so it resizes smoothly (not clipped by fixed-width content below) */}
          <View
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              paddingHorizontal: 12,
              paddingBottom: ADD_BTN_PAD_BOTTOM,
              paddingTop: ADD_BTN_PAD_TOP,
            }}
          >
            {count === 0 ? (
              <AppButton
                title="ADD"
                onPress={increment}
                disabled={isPending}
                loading={isPending}
                accessibilityRole="button"
                accessibilityLabel={`Add ${recommended.name} to cart`}
                accessibilityState={{ disabled: isPending }}
                textClassName="font-inter-bold"
              />
            ) : (
              <View
                className="flex-row items-center border-[1.5px] border-[#E5E7EB] rounded-[10px] bg-white"
                style={{
                  height: ADD_BTN_HEIGHT,
                  opacity: isPending ? 0.55 : 1,
                }}
              >
                <Touchable
                  onPress={decrement}
                  disabled={isPending}
                  accessibilityRole="button"
                  accessibilityLabel="Decrease quantity"
                  accessibilityState={{ disabled: isPending }}
                  className="flex-1 items-center justify-center h-full"
                >
                  <Text
                    className="font-inter-semibold text-brand-text"
                    style={{ fontSize: moderateScale(24) }}
                  >
                    −
                  </Text>
                </Touchable>
                <View
                  style={{
                    width: 32,
                    height: 24,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {isPending ? (
                    <ActivityIndicator size="small" color="#0F7635" />
                  ) : (
                    <Animated.Text
                      style={{
                        transform: [{ translateY: slideAnim }],
                        opacity: opacityAnim,
                        fontSize: moderateScale(16),
                      }}
                      className="font-inter-bold text-brand-text text-center px-2"
                    >
                      {count}
                    </Animated.Text>
                  )}
                </View>
                <Touchable
                  onPress={increment}
                  disabled={isPending}
                  accessibilityRole="button"
                  accessibilityLabel="Increase quantity"
                  accessibilityState={{ disabled: isPending }}
                  className="flex-1 items-center justify-center h-full"
                >
                  <Text
                    className="font-inter-semibold text-brand-text"
                    style={{ fontSize: moderateScale(22) }}
                  >
                    +
                  </Text>
                </Touchable>
              </View>
            )}
          </View>
        </View>
      </ReAnimated.View>

      {/* Fixed-size clip with pure translateX reveal; box-none lets taps reach add button on shell above */}
      <ReAnimated.View
        pointerEvents="box-none"
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          width: cardWidth,
          overflow: "hidden",
          zIndex: 11,
        }}
      >
        <ReAnimated.View
          style={[{ width: cardWidth, flex: 1 }, contentRevealStyle]}
        >
          <View className="flex-1 flex-col justify-between">
            {/* WRAPPER FOR MEASUREMENT */}
            <View
              style={{
                width: cardWidth,
                minHeight: Math.max(0, boardHeight - ADD_SECTION_HEIGHT),
              }}
              onLayout={(e) => {
                const h = Math.ceil(
                  e.nativeEvent.layout.height + ADD_SECTION_HEIGHT,
                );
                setHeights((current) =>
                  current.recommended === h
                    ? current
                    : { ...current, recommended: h },
                );
              }}
            >
              {/* TOP INNER ROW HOLDING COLUMNS */}
              <View className="flex-row flex-1">
                {/* LEFT PRODUCT INFO COLUMN */}
                <Animated.View
                  style={{ width: leftColWidth }}
                  className="px-[12px] pt-[12px] pb-0 flex-col"
                >
                  <View>
                    <Text
                      className="font-inter-bold text-[#0F7635] uppercase tracking-[0.8px] mb-2"
                      style={{
                        height: 16,
                        lineHeight: moderateScale(16),
                        fontSize: moderateScale(11),
                      }}
                    >
                      WE RECOMMENDED
                    </Text>
                    <View className="bg-white border border-[#E5E7EB] rounded-[10px] h-[100px] mb-2 items-center justify-center overflow-hidden">
                      {recommended.image ? (
                        <ExpoImage
                          source={recommended.image}
                          style={{ width: "85%", height: "85%" }}
                          contentFit="contain"
                          cachePolicy="memory-disk"
                        />
                      ) : (
                        <icons.placeholder width="70%" height="70%" />
                      )}
                    </View>
                    <Text
                      className="font-inter-bold text-[#111827]"
                      style={{
                        // Must match the searched card above or the two columns misalign.
                        fontSize: moderateScale(15),
                        lineHeight: moderateScale(19),
                        minHeight: moderateScale(38),
                        marginBottom: moderateScale(4),
                      }}
                      numberOfLines={2}
                    >
                      {recommended.name}
                    </Text>
                    <Text
                      className="font-inter-bold text-[#009989]"
                      style={{
                        fontSize: moderateScale(12),
                        lineHeight: moderateScale(15),
                        minHeight: moderateScale(30),
                        marginBottom: 3,
                      }}
                      numberOfLines={2}
                    >
                      {recommended.manufacturer}
                    </Text>
                    <Text
                      className="font-inter text-brand-subtext"
                      style={{
                        fontSize: moderateScale(11),
                        lineHeight: moderateScale(15),
                        minHeight: moderateScale(30),
                      }}
                      numberOfLines={2}
                    >
                      {recommended.description}
                    </Text>
                  </View>
                  <View style={{ marginTop: "auto" }}>
                    {(() => {
                      const searchedPrice = searched.price ?? 0;
                      const crossSaving =
                        searchedPrice > 0
                          ? parseFloat(
                              (searchedPrice - recommended.price).toFixed(2),
                            )
                          : 0;
                      const ownSaving = parseFloat(
                        (
                          parseFloat(recommended.mrpDisplay) -
                          parseFloat(recommended.priceDisplay)
                        ).toFixed(2),
                      );
                      const effectiveSaving =
                        crossSaving > 0
                          ? crossSaving
                          : ownSaving > 0
                            ? ownSaving
                            : 0;

                      if (effectiveSaving <= 0)
                        return <View style={{ height: 30 }} />;
                      return (
                        <View style={{ height: 30, justifyContent: "center" }}>
                          <LinearGradient
                            colors={["#C22923", "#FF8A00"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={{
                              alignSelf: "flex-start",
                              paddingHorizontal: 8,
                              paddingVertical: 4,
                              borderRadius: 6,
                              overflow: "hidden",
                            }}
                          >
                            <Text
                              className="font-inter-semibold text-white"
                              style={{ fontSize: moderateScale(10) }}
                            >
                              Save ₹{effectiveSaving.toFixed(2)}
                            </Text>
                            <OfferShine borderRadius={6} />
                          </LinearGradient>
                        </View>
                      );
                    })()}
                    <ComparisonDivider />
                    {/* Price & Strikethrough Slot */}
                    <View style={{ height: 28, justifyContent: "center" }}>
                      <View className="flex-row items-baseline gap-x-2">
                        <Text
                          className="font-inter-extrabold text-[#0F7635]"
                          style={{ fontSize: moderateScale(20) }}
                        >
                          ₹{recommended.priceDisplay}
                        </Text>
                        {parseFloat(recommended.mrpDisplay) >
                          parseFloat(recommended.priceDisplay) && (
                          <Text
                            className="font-inter-medium text-brand-subtext line-through"
                            style={{ fontSize: moderateScale(12) }}
                          >
                            ₹{recommended.mrpDisplay}
                          </Text>
                        )}
                      </View>
                    </View>

                    {/* Unit price spacer — matches left card unit price text height */}
                    <View style={{ height: 16 }} />
                  </View>
                </Animated.View>

                {/* RIGHT DOCTOR TRUSTED GRAPHIC COLUMN */}
                <ReAnimated.View
                  style={[
                    {
                      width: cardWidth / 2,
                      paddingHorizontal: 12,
                      paddingTop: 40,
                      paddingBottom: 0,
                      flexDirection: "column",
                      justifyContent: "space-between",
                    },
                    rightColAnimatedStyle,
                  ]}
                >
                  <View
                    className="flex-1 rounded-[12px] overflow-hidden"
                    style={{ backgroundColor: "#E1F0D5", minHeight: 140 }}
                  >
                    <ExpoImage
                      source={HOME_IMAGES.doctorLogo}
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        width: moderateScale(100),
                        height: moderateScale(100),
                      }}
                      contentFit="contain"
                      contentPosition="bottom left"
                      cachePolicy="memory-disk"
                    />
                    <View className="px-3 pt-3 z-10 w-[70%]">
                      <Text
                        className="font-inter-extrabold text-brand-text leading-[18px]"
                        style={{ fontSize: moderateScale(14) }}
                      >
                        Doctor{"\n"}Trusted{"\n"}Medicines
                      </Text>
                    </View>
                    <ExpoImage
                      source={HOME_IMAGES.doctor}
                      style={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        width: "85%",
                        height: "95%",
                        zIndex: 5,
                      }}
                      contentFit="contain"
                      contentPosition="bottom right"
                      cachePolicy="memory-disk"
                    />
                  </View>

                  <View className="mt-3 flex-row items-center justify-center bg-white rounded-[8px] border border-[#919EAB33] py-2">
                    <ExpoImage
                      source={HOME_IMAGES.shield}
                      style={{ width: 18, height: 18, marginRight: 4 }}
                      contentFit="contain"
                      cachePolicy="memory-disk"
                    />
                    <Text
                      className="font-inter-medium text-brand-text"
                      style={{ fontSize: moderateScale(12) }}
                    >
                      CareSure Assured
                    </Text>
                  </View>
                </ReAnimated.View>
              </View>
            </View>
          </View>
        </ReAnimated.View>
      </ReAnimated.View>

      {/* Floating swap button with UI-thread opacity animation (Reanimated) */}
      <ReAnimated.View
        style={[
          swapBtnStyle,
          {
            position: "absolute",
            top: 62,
            left: "50%",
            marginLeft: -24,
            width: 48,
            height: 48,
            borderRadius: 24,
            zIndex: 20,
            elevation: 5,
          },
        ]}
      >
        <Touchable
          onPress={handleSwap}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Expand or collapse recommended view"
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: "#F1FFF6",
            borderWidth: 1,
            borderColor: "#D1FAE5",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Animated.Image
            source={HOME_IMAGES.swap}
            style={{
              width: 18,
              height: 18,
              tintColor: colors.primary,
              transform: [{ rotate: swapRotateDeg }],
            }}
            resizeMode="contain"
          />
        </Touchable>
      </ReAnimated.View>
    </View>
    </GestureDetector>
  );
};
