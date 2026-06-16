import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { HOME_IMAGES } from "@/src/constants/images";
import { colors } from "@/src/constants/theme";
import { useCartActions } from "@/src/hooks/useCartActions";
import { RecommendedProduct, SearchedProduct } from "@/src/types/search";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  PanResponder,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import ReAnimated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface ComparisonBoardProps {
  searched: SearchedProduct;
  recommended: RecommendedProduct;
  productId: string;
  medicineUuid?: string;
  slug?: string;
  requiresPrescription?: boolean;
}

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

  // Measure the right-section content row to determine the correct board height
  const [boardHeight, setBoardHeight] = useState(380);
  const ADD_BTN_SECTION_H = 80; // pt-3 + border + btn + pb-3.5 + mt-3

  // Animated value driving the expandable We Recommended section: 0 = half-width, 1 = full-width
  const expandAnim = useRef(new Animated.Value(0)).current;
  const currentExpandVal = useRef(0);
  const expandStartVal = useRef(0);
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

  useEffect(() => {
    const id = expandAnim.addListener(({ value }) => {
      currentExpandVal.current = value;
    });
    return () => expandAnim.removeListener(id);
  }, [expandAnim]);

  const handleSwap = () => {
    isExpanded.current = !isExpanded.current;

    animateSwapBtn(isExpanded.current ? 0 : 1);

    swapRotate.setValue(0);
    Animated.timing(swapRotate, {
      toValue: 1,
      duration: 380,
      useNativeDriver: true,
    }).start();

    Animated.spring(expandAnim, {
      toValue: isExpanded.current ? 1 : 0,
      useNativeDriver: false,
      bounciness: 4,
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      // Claim horizontal swipes from the very first touch so quick flicks are caught
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const { dx, dy } = gestureState;
        // Lower threshold (5px) so light swipes are claimed before the user lifts
        return Math.abs(dx) > 5 && Math.abs(dx) > Math.abs(dy) * 1.5;
      },
      onPanResponderGrant: () => {
        expandStartVal.current = currentExpandVal.current;
      },
      onPanResponderMove: (_, gestureState) => {
        let newVal =
          expandStartVal.current + -gestureState.dx / (cardWidth / 2);
        newVal = Math.min(1, Math.max(0, newVal));
        expandAnim.setValue(newVal);
        swapBtnOpacity.value = Math.max(0, 1 - newVal * 2.5);
      },
      onPanResponderRelease: (_, gestureState) => {
        const { vx, dx } = gestureState;
        const pos = currentExpandVal.current;

        // Velocity-first: even a light flick at vx > 0.2 is decisive
        const fastLeft = vx < -0.2;
        const fastRight = vx > 0.2;

        let expand: boolean;
        if (fastLeft) expand = true;
        else if (fastRight) expand = false;
        // Slow drag — snap to nearest side
        else expand = pos >= 0.5;

        isExpanded.current = expand;
        Animated.spring(expandAnim, {
          toValue: expand ? 1 : 0,
          useNativeDriver: false,
          bounciness: 4,
        }).start();
        animateSwapBtn(expand ? 0 : 1);
      },
      onPanResponderTerminate: () => {
        // Another gesture (e.g. scroll) stole the touch — snap to nearest side cleanly
        const expand = currentExpandVal.current >= 0.5;
        isExpanded.current = expand;
        Animated.spring(expandAnim, {
          toValue: expand ? 1 : 0,
          useNativeDriver: false,
          bounciness: 4,
        }).start();
        animateSwapBtn(expand ? 0 : 1);
      },
    }),
  ).current;

  const swapRotateDeg = swapRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const recLeft = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [cardWidth / 2, 0],
  });

  const recWidth = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [cardWidth / 2, cardWidth],
  });

  const recBgColor = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#FEFFF9", "#FEFFF9"],
  });

  return (
    <View
      className="mx-4 mb-2 overflow-hidden"
      style={{
        width: cardWidth,
        height: boardHeight,
        backgroundColor: "transparent",
      }}
      {...panResponder.panHandlers}
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
            <View style={{ height: 210 }}>
              <Text
                className="text-[11px] font-inter-bold text-[#4B5563] uppercase tracking-[0.8px] mb-2"
                style={{ height: 16, lineHeight: 16 }}
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
                className="text-[15px] font-inter-bold text-[#111827] mb-1 leading-[20px]"
                numberOfLines={2}
              >
                {searched.name}
              </Text>
              <Text className="text-[12px] font-inter-medium text-brand-subtext mb-[3px]">
                {searched.manufacturer}
              </Text>
              <Text
                className="text-[11px] font-inter text-brand-subtext"
                numberOfLines={2}
              >
                {searched.description}
              </Text>
            </View>

            <View style={{ marginTop: "auto" }}>
              <View
                style={{
                  borderTopWidth: 1,
                  borderColor: "#E5E7EB",
                  borderStyle: "dashed",
                  marginVertical: 8,
                }}
              />
              {/* Price Slot */}
              <View style={{ height: 28, justifyContent: "center" }}>
                <Text className="text-[20px] font-inter-extrabold text-[#111827] mb-[2px]">
                  ₹{searched.priceDisplay}
                </Text>
              </View>
              {/* Unit Price */}
              <Text className="text-[11px] font-inter-medium text-brand-subtext mb-0">
                ₹{searched.unitPriceDisplay}/ Unit
              </Text>
            </View>
          </View>

          {/* Status Slot Container at the bottom (aligned with Add Button) */}
          <View
            className="px-[12px] pb-[8px] pt-[8px]"
            style={{ height: 62, justifyContent: "center" }}
          >
            <Text className="text-[12px] font-inter-semibold text-[#EF4444]">
              {searched.status}
            </Text>
          </View>
        </View>
      </View>

      {/* EXPANDABLE WE RECOMMENDED SECTION */}
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: recLeft,
          width: recWidth,
          paddingLeft: expandAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [4, 0],
          }),
          backgroundColor: "transparent",
          overflow: "hidden",
          zIndex: 10,
        }}
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
              style={{ width: cardWidth }}
              onLayout={(e) => {
                const h = e.nativeEvent.layout.height + 62;
                if (h !== boardHeight) setBoardHeight(h);
              }}
            >
              {/* TOP INNER ROW HOLDING COLUMNS */}
              <View className="flex-row">
                {/* LEFT PRODUCT INFO COLUMN */}
                <View
                  style={{ width: cardWidth / 2 }}
                  className="px-[12px] pt-[12px] pb-0 flex-col"
                >
                  <View style={{ height: 210 }}>
                    <Text
                      className="text-[11px] font-inter-bold text-[#0F7635] uppercase tracking-[0.8px] mb-2"
                      style={{ height: 16, lineHeight: 16 }}
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
                      className="text-[15px] font-inter-bold text-[#111827] leading-[20px]"
                      numberOfLines={2}
                    >
                      {recommended.name}
                    </Text>
                    <Text className="text-[12px] font-inter-bold text-[#0F7635] mt-0.5">
                      {recommended.manufacturer}
                    </Text>
                    <Text
                      className="text-[11px] font-inter text-brand-subtext mt-0.5"
                      numberOfLines={2}
                    >
                      {recommended.description}
                    </Text>
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

                      if (effectiveSaving <= 0) return null;
                      return (
                        <LinearGradient
                          colors={["#C22923", "#FF8A00"]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={{
                            alignSelf: "flex-start",
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 6,
                            marginTop: 6,
                          }}
                        >
                          <Text className="text-[10px] font-inter-semibold text-white">
                            Save ₹{effectiveSaving.toFixed(2)}
                          </Text>
                        </LinearGradient>
                      );
                    })()}
                  </View>
                  <View style={{ marginTop: "auto" }}>
                    <View
                      style={{
                        borderTopWidth: 1,
                        borderColor: "#E5E7EB",
                        borderStyle: "dashed",
                        marginVertical: 16,
                      }}
                    />
                    {/* Price & Strikethrough Slot */}
                    <View style={{ height: 28, justifyContent: "center" }}>
                      <View className="flex-row items-baseline gap-x-2">
                        <Text className="text-[20px] font-inter-extrabold text-[#0F7635]">
                          ₹{recommended.priceDisplay}
                        </Text>
                        {parseFloat(recommended.mrpDisplay) >
                          parseFloat(recommended.priceDisplay) && (
                          <Text className="text-[12px] font-inter-medium text-brand-subtext line-through">
                            ₹{recommended.mrpDisplay}
                          </Text>
                        )}
                      </View>
                    </View>

                    {/* Unit price spacer to align with left card */}
                    <View style={{ height: 14 }} />
                  </View>
                </View>

                {/* RIGHT DOCTOR TRUSTED GRAPHIC COLUMN */}
                <Animated.View
                  style={{
                    width: cardWidth / 2,
                    opacity: expandAnim,
                  }}
                  className="px-[12px] pt-7 pb-0 flex-col justify-between"
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
                        width: 100,
                        height: 100,
                      }}
                      resizeMode="contain"
                    />
                    <View className="px-3 pt-3 z-10 w-[70%]">
                      <Text className="text-[13px] font-inter-extrabold text-brand-text leading-[17px]">
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

                  <View className="mt-3 flex-row items-center justify-center bg-white rounded-[8px] border border-[#919EAB33] py-1.5">
                    <Image
                      source={HOME_IMAGES.shield}
                      style={{ width: 18, height: 18, marginRight: 4 }}
                      resizeMode="contain"
                    />
                    <Text className="text-[11px] font-inter-medium text-brand-text">
                      CareSure Assured
                    </Text>
                  </View>
                </Animated.View>
              </View>
            </View>

            {/* ADD BUTTON CONTAINER AT THE BOTTOM */}
            <View
              style={{
                paddingHorizontal: 12,
                paddingBottom: 8,
                paddingTop: 8,
              }}
            >
              {count === 0 ? (
                <Touchable
                  onPress={handleIncrement}
                  disabled={isPending}
                  accessibilityRole="button"
                  accessibilityLabel={`Add ${recommended.name} to cart`}
                  className="bg-brand-primary rounded-[12px] items-center justify-center"
                  style={{ height: 46 }}
                >
                  <Text className="text-[15px] font-inter-bold text-white">
                    {isPending ? "Adding..." : "Add"}
                  </Text>
                </Touchable>
              ) : (
                <View
                  className="flex-row items-center border-[1.5px] border-[#E5E7EB] rounded-[12px] bg-white"
                  style={{ height: 46 }}
                >
                  <Touchable
                    onPress={handleDecrement}
                    disabled={isPending}
                    className="flex-1 items-center justify-center h-full"
                  >
                    <Text className="text-[24px] font-inter-semibold text-brand-text">
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
                        }}
                        className="text-[16px] font-inter-bold text-brand-text text-center px-2"
                      >
                        {count}
                      </Animated.Text>
                    )}
                  </View>
                  <Touchable
                    onPress={handleIncrement}
                    disabled={isPending}
                    className="flex-1 items-center justify-center h-full"
                  >
                    <Text className="text-[22px] font-inter-semibold text-brand-text">
                      +
                    </Text>
                  </Touchable>
                </View>
              )}
            </View>
          </View>
        </Animated.View>
      </Animated.View>

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
  );
};
