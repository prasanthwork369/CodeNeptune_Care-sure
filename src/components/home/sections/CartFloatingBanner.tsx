import { useCartFloatingBannerAnimation } from "@/src/components/animations/floatingBanner";
import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { useCart } from "@/src/hooks/queries/useCart";
import { useUIStore } from "@/src/store/uiStore";
import React, { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Image, Text, View } from "react-native";
import Animated from "react-native-reanimated";

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
  borderRadius: 28,
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
  const { isUploadButtonCollapsed, isTabBarVisible } = useUIStore();
  const lastAddedItem =
    [...items].reverse().find((i) => i.image ?? i.metadata?.image) ??
    items[items.length - 1] ??
    null;

  const {
    isSlid,
    handleSlide,
    handleSnapBack,
    handleClosePress,
    triggerRemoveAnimation,
    bannerStyle,
    containerStyle,
    buttonAnimatedStyle,
    buttonTextAnimatedStyle,
    itemCountAnimatedStyle,
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
      await triggerRemoveAnimation();
      await clearCart();
    } catch (error) {
      console.error("Failed to clear cart:", error);
    } finally {
      setIsClearing(false);
      onInteractionChange?.(false);
    }
  }, [clearCart, onInteractionChange, triggerRemoveAnimation]);

  return (
    <Animated.View style={containerStyle}>
      <View
        style={{
          shadowColor: "#919EAB",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 10,
          elevation: 4,
          borderRadius: 999,
          backgroundColor: "white",
        }}
      >
        <View
          style={{
            borderRadius: 999,
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
                style={{ borderRadius: 999, height: 65 }}
              >
                <View
                  className="mr-3 justify-center"
                  style={{ width: totalItems > 1 ? 52 : 44, height: 48 }}
                >
                  {totalItems > 1 && (
                    <View
                      className="absolute left-0 bg-white rounded-full border border-[#919EAB33] items-center justify-center"
                      style={{ width: 44, height: 44 }}
                    >
                      {secondImage ? (
                        <Image
                          source={secondImage}
                          style={{ width: 30, height: 30 }}
                          resizeMode="contain"
                        />
                      ) : (
                        <icons.placeholder width={30} height={30} />
                      )}
                    </View>
                  )}
                  <View
                    className="bg-white rounded-full border border-[#919EAB33] items-center justify-center"
                    style={{
                      width: 44,
                      height: 44,
                      position: totalItems > 1 ? "absolute" : "relative",
                      left: totalItems > 1 ? 8 : 0,
                    }}
                  >
                    {displayImage ? (
                      <Image
                        source={displayImage}
                        style={{ width: 30, height: 30 }}
                        resizeMode="contain"
                      />
                    ) : (
                      <icons.placeholder width={30} height={30} />
                    )}
                  </View>
                </View>

                <View className="flex-1 justify-center">
                  <Text
                    className="text-[14px] font-inter-bold text-[#1A1C1E] leading-[18px]"
                    numberOfLines={1}
                  >
                    {displayTitle}
                  </Text>
                  <Text className="text-[14px] font-inter-bold text-[#1A1C1E] leading-[18px]">
                    {displaySubtitle}
                  </Text>
                </View>

                <View className="flex-row items-center gap-x-2">
                  <Touchable activeOpacity={0.9} onPress={onViewCart}>
                    <Animated.View style={[BUTTON_STATIC, buttonAnimatedStyle]}>
                      <AnimatedText
                        style={[
                          { color: "white", fontFamily: "Inter-Bold" },
                          buttonTextAnimatedStyle,
                        ]}
                      >
                        View Cart
                      </AnimatedText>
                      <AnimatedText
                        style={[
                          { color: "white", fontFamily: "Inter-SemiBold" },
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
                    <icons.close_small width={12} height={12} fill="#6A6A6A" />
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
                width: 90,
                height: "100%",
                backgroundColor: "#ECFDF5",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 999,
              }}
            >
              {isClearing ? (
                <ActivityIndicator size="small" color="#0F7635" />
              ) : (
                <Text className="text-[14px] font-inter-semibold text-[#0F7635]">
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
