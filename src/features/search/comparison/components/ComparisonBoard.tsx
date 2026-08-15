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
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import ReAnimated, {
  interpolate,
  runOnJS,
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

// Add-button section sizing. The board height is measured from the columns only,
// so this section's height is added on top — keep the measurement offset derived
// from these values so the bottom padding can never drift out of sync and clip.
const ADD_BTN_HEIGHT = 50;
const ADD_BTN_PAD_TOP = 6;
const ADD_BTN_PAD_BOTTOM = 16;
// Total height of the bottom section. Both the recommended card's Add-button
// section AND the searched card's status slot use this, so the two cards' dashed
// dividers always line up. Change the padding above and both follow together.
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
      variantId: null,
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
  const handleIncrement = increment;
  const handleDecrement = decrement;

  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = screenWidth - 32;

  // Both cards can have different two-line names/manufacturers. Measure each
  // side and use the taller requirement so neither card is clipped.
  const [boardHeight, setBoardHeight] = useState(380);
  const [searchedTopHeight, setSearchedTopHeight] = useState(0);
  const [searchedBottomHeight, setSearchedBottomHeight] = useState(0);
  const [recommendedHeight, setRecommendedHeight] = useState(0);

  useEffect(() => {
    setBoardHeight(380);
    setSearchedTopHeight(0);
    setSearchedBottomHeight(0);
    setRecommendedHeight(0);
  }, [productId]);

  useEffect(() => {
    const searchedHeight =
      searchedTopHeight > 0 && searchedBottomHeight > 0
        ? searchedTopHeight + searchedBottomHeight + 12 + ADD_SECTION_HEIGHT
        : 0;
    const nextHeight = Math.ceil(
      Math.max(380, searchedHeight, recommendedHeight),
    );
    setBoardHeight((current) =>
      current === nextHeight ? current : nextHeight,
    );
  }, [recommendedHeight, searchedBottomHeight, searchedTopHeight]);

  // Reanimated shared value driving the expandable We Recommended section:
  // 0 = half-width, 1 = full-width. Written directly from the drag gesture's
  // UI-thread worklet below — no per-move JS-thread round trip, which is
  // what the old PanResponder + legacy Animated version paid on every touch
  // move.
  const expandProgress = useSharedValue(0);
  // expandProgress's value at gesture start, so onUpdate can offset from it.
  const expandStart = useSharedValue(0);
  const touchStart = useSharedValue({ x: 0, y: 0 });
  const isExpanded = useRef(false);
  const swapRotate = useRef(new Animated.Value(0)).current;

  // Reanimated shared value — UI thread only, zero blink
  const swapBtnOpacity = useSharedValue(1);
  const swapBtnStyle = useAnimatedStyle(() => ({
    opacity: swapBtnOpacity.value,
  }));

  const animateSwapBtn = (toValue: number) => {
    swapBtnOpacity.value = withTiming(toValue, { duration: 180 });
  };

  // Bridges the gesture worklet's expand/collapse decision back to the
  // JS-only `isExpanded` ref, so a later swap-button tap toggles from
  // wherever the drag settled.
  const setIsExpandedFlag = (expand: boolean) => {
    isExpanded.current = expand;
  };

  const handleSwap = () => {
    isExpanded.current = !isExpanded.current;

    animateSwapBtn(isExpanded.current ? 0 : 1);

    swapRotate.setValue(0);
    Animated.timing(swapRotate, {
      // Was a hardcoded 380ms, which reads sluggish for a small control and
      // bypassed the shared scale. durations.slow is the app's 300ms step.
      toValue: 1,
      duration: durations.slow,
      useNativeDriver: true,
    }).start();

    expandProgress.value = withSpring(isExpanded.current ? 1 : 0);
  };

  // Mirrors the pre-migration PanResponder exactly: claims the gesture only
  // once a horizontal move exceeds 5px and is steeper than a 1.5x dx:dy
  // ratio (so a vertical scroll on the parent screen still wins), and yields
  // explicitly once a move is clearly vertical instead. Velocity here is in
  // points/second vs PanResponder's points/ms, hence comparing against 200
  // (not 0.2) below — same threshold, converted units.
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
      // Velocity-first: even a light flick at 200pt/s (== old 0.2pt/ms) is decisive
      const fastLeft = e.velocityX < -200;
      const fastRight = e.velocityX > 200;

      let expand: boolean;
      if (fastLeft) expand = true;
      else if (fastRight) expand = false;
      // Slow drag — snap to nearest side
      else expand = pos >= 0.5;

      expandProgress.value = withSpring(expand ? 1 : 0);
      swapBtnOpacity.value = withTiming(expand ? 0 : 1, { duration: 180 });
      runOnJS(setIsExpandedFlag)(expand);
    })
    .onFinalize((_e, success) => {
      // Another gesture (e.g. scroll) stole the touch — snap to nearest side cleanly.
      // A normal release already handled everything in onEnd above.
      if (success) return;
      const expand = expandProgress.value >= 0.5;
      expandProgress.value = withSpring(expand ? 1 : 0);
      swapBtnOpacity.value = withTiming(expand ? 0 : 1, { duration: 180 });
      runOnJS(setIsExpandedFlag)(expand);
    });

  const swapRotateDeg = swapRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  // Was an interpolation between two identical colours — it drove a colour
  // calculation every frame for no visual change. It is simply a constant.
  const recBgColor = "#FEFFF9";

  const expandableSectionStyle = useAnimatedStyle(() => ({
    left: interpolate(expandProgress.value, [0, 1], [cardWidth / 2, 0]),
    width: interpolate(
      expandProgress.value,
      [0, 1],
      [cardWidth / 2, cardWidth],
    ),
    paddingLeft: interpolate(expandProgress.value, [0, 1], [4, 0]),
  }));

  const rightColAnimatedStyle = useAnimatedStyle(() => ({
    opacity: expandProgress.value,
  }));

  // The recommended column lives inside a full-width measurement layer, but in the
  // collapsed state the visible half-card is narrower by the section's paddingLeft (4)
  // plus the card's two 1.25px borders. Subtract that so the column's 12px right padding
  // isn't clipped — matching the searched (left) card's symmetric 12/12 image gap.
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
              onLayout={(event) =>
                setSearchedTopHeight(event.nativeEvent.layout.height)
              }
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
                  <Image
                    source={searched.image}
                    style={{ width: "85%", height: "85%" }}
                    resizeMode="contain"
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
              onLayout={(event) =>
                setSearchedBottomHeight(event.nativeEvent.layout.height)
              }
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

          {/* Status Slot Container at the bottom — same height as the recommended
              card's Add-button section so both cards' dashed dividers line up. */}
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

      {/* EXPANDABLE WE RECOMMENDED SECTION */}
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
        <Animated.View
          style={{
            flex: 1,
            backgroundColor: recBgColor,
            borderWidth: 1.25,
            borderColor: "#DBF6A080",
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          <View className="flex-1 flex-col justify-between">
            {/* WRAPPER FOR MEASUREMENT */}
            <View
              style={{
                width: cardWidth,
                minHeight: Math.max(0, boardHeight - ADD_SECTION_HEIGHT),
              }}
              onLayout={(e) => {
                const h = e.nativeEvent.layout.height + ADD_SECTION_HEIGHT;
                setRecommendedHeight(h);
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
                        <Image
                          source={recommended.image}
                          style={{ width: "85%", height: "85%" }}
                          resizeMode="contain"
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
                    <Image
                      source={HOME_IMAGES.doctorLogo}
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        width: moderateScale(100),
                        height: moderateScale(100),
                      }}
                      resizeMode="contain"
                    />
                    <View className="px-3 pt-3 z-10 w-[70%]">
                      <Text
                        className="font-inter-extrabold text-brand-text leading-[18px]"
                        style={{ fontSize: moderateScale(14) }}
                      >
                        Doctor{"\n"}Trusted{"\n"}Medicines
                      </Text>
                    </View>
                    <Image
                      source={HOME_IMAGES.doctor}
                      style={{
                        position: "absolute",
                        bottom: -15,
                        right: -25,
                        width: "90%",
                        height: "90%",
                        zIndex: 5,
                      }}
                      resizeMode="contain"
                    />
                  </View>

                  <View className="mt-3 flex-row items-center justify-center bg-white rounded-[8px] border border-[#919EAB33] py-2">
                    <Image
                      source={HOME_IMAGES.shield}
                      style={{ width: 18, height: 18, marginRight: 4 }}
                      resizeMode="contain"
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

            {/* ADD BUTTON CONTAINER AT THE BOTTOM */}
            <View
              style={{
                paddingHorizontal: 12,
                paddingBottom: ADD_BTN_PAD_BOTTOM,
                paddingTop: ADD_BTN_PAD_TOP,
              }}
            >
              {count === 0 ? (
                <AppButton
                  title="ADD"
                  onPress={handleIncrement}
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
                    onPress={handleDecrement}
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
                    onPress={handleIncrement}
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
        </Animated.View>
      </ReAnimated.View>

      {/* FLOATING SWAP BUTTON — Reanimated UI-thread opacity, zero blink */}
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
