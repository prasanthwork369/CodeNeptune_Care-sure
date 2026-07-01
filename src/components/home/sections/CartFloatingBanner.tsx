import { useCartFloatingBannerAnimation } from "@/src/components/animations/floatingBanner";
import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { useCart } from "@/src/hooks/queries/useCart";
import { useUIStore } from "@/src/store/uiStore";
import React, { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { Image } from "expo-image";
import Animated from "react-native-reanimated";
import { exactScale, moderateScale } from "@/src/utils/exactScale";

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
  const { totalItems, items, clearCart } = useCart();
  const { isUploadButtonCollapsed, isTabBarVisible, setTabBarVisible, setUploadButtonCollapsed } = useUIStore();
  const lastAddedItem =
    [...items].reverse().find((i) => i.image ?? i.metadata?.image) ??
    items[items.length - 1] ??
    null;

  const {
    isSlid,
    handleSlide,
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
    isTabBarVisible,
    isUploadButtonCollapsed,
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

  const displayImageUri =
    lastAddedItem?.image ?? lastAddedItem?.metadata?.image ?? null;
  const displayImage = useMemo(
    () => (displayImageUri ? { uri: displayImageUri } : null),
    [displayImageUri],
  );

  const secondItem =
    items.length >= 2
      ? ([...items]
          .reverse()
          .find((i) => (i.image ?? i.metadata?.image) && i !== lastAddedItem) ??
        items[items.length - 2])
      : null;
  const secondImageUri =
    secondItem?.image ?? secondItem?.metadata?.image ?? null;
  const secondImage = useMemo(
    () => (secondImageUri ? { uri: secondImageUri } : null),
    [secondImageUri],
  );

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
      await new Promise((resolve) => setTimeout(resolve, hideAnimationDuration));
      setTabBarVisible(true);
      setUploadButtonCollapsed(false);
    } catch (error) {
      console.error("Failed to clear cart:", error);
    } finally {
      setIsClearing(false);
      onInteractionChange?.(false);
    }
  }, [clearCart, onInteractionChange, hideAnimationDuration, setTabBarVisible, setUploadButtonCollapsed]);

  return (
    <Animated.View style={containerStyle}>
      <View
        style={{
          shadowColor: "#919EAB",
          shadowOffset: { width: 0, height: exactScale(4) },
          shadowOpacity: 0.2,
          shadowRadius: 10,
          elevation: 4,
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
                className="flex-row items-center px-3 bg-white"
                style={{ borderRadius: exactScale(999), height: exactScale(65) }}
              >
                <View
                  className="mr-3 justify-center"
                  style={{ width: totalItems > 1 ? 52 : 44, height: exactScale(48) }}
                >
                  {totalItems > 1 && (
                    <View
                      className="absolute left-0 bg-white rounded-full border border-[#919EAB33] items-center justify-center"
                      style={{ width: exactScale(44), height: exactScale(44) }}
                    >
                      {secondImage ? (
                        <Image
                          source={secondImage}
                          style={{ width: exactScale(30), height: exactScale(30) }}
                          resizeMode="contain"
                        />
                      ) : (
                        <icons.placeholder width={exactScale(30)} height={exactScale(30)} />
                      )}
                    </View>
                  )}
                  <View
                    className="bg-white rounded-full border border-[#919EAB33] items-center justify-center"
                    style={{
                      width: exactScale(44),
                      height: exactScale(44),
                      position: totalItems > 1 ? "absolute" : "relative",
                      left: totalItems > 1 ? 8 : 0,
                    }}
                  >
                    {displayImage ? (
                      <Image
                        source={displayImage}
                        style={{ width: exactScale(30), height: exactScale(30) }}
                        resizeMode="contain"
                      />
                    ) : (
                      <icons.placeholder width={exactScale(30)} height={exactScale(30)} />
                    )}
                  </View>
                </View>

                <View className="flex-1 justify-center">
                  <Text
                    className="font-inter-bold text-[#1A1C1E]"
                    numberOfLines={1}
                    style={{ fontSize: moderateScale(14, 0.1), lineHeight: moderateScale(18, 0.1) }}
                  >
                    {displayTitle}
                  </Text>
                  <Text
                    className="font-inter-bold text-[#1A1C1E]"
                    style={{ fontSize: moderateScale(14, 0.1), lineHeight: moderateScale(18, 0.1) }}
                  >
                    {displaySubtitle}
                  </Text>
                </View>

                <View className="flex-row items-center gap-x-2">
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
                    className="w-[30px] h-[30px] rounded-full bg-[#F3F4F6] items-center justify-center"
                  >
                    <icons.close_small width={exactScale(12)} height={exactScale(12)} fill="#6A6A6A" />
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
                right: -90,
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
                <Text className="font-inter-semibold text-[#0F7635]" style={{ fontSize: moderateScale(14, 0.1) }}>
                  Remove
                </Text>
              )}
            </Touchable>
          </Animated.View>
        </View>
      </View>
    </Animated.View>
  );
};
