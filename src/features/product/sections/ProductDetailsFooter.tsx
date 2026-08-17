import { AppButton } from "@/src/components/ui/AppButton";
import { StickyFooter } from "@/src/components/ui/StickyFooter";
import { Touchable } from "@/src/components/ui/Touchable";
import { OfferShine } from "@/src/components/ui/offerShine";
import { useCartRead } from "@/src/hooks/queries/useCartRead";
import { useCartActions } from "@/src/features/cart/hooks/useCartActions";
import { ProductDetailsFooterProps } from "@/src/features/product/types";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import React from "react";
import { ActivityIndicator, Animated, Text, View } from "react-native";

export const ProductDetailsFooter: React.FC<ProductDetailsFooterProps> =
  React.memo(
    ({
      productId,
      medicineUuid,
      baseMedicineId,
      variantId,
      product,
      safeAreaBottom,
      onViewCart,
      hideAddButton = false,
    }) => {
  const { count, increment, decrement, animations, isPending } = useCartActions(
    {
      medicineId: medicineUuid ?? productId,
      baseMedicineId,
      variantId: variantId ?? null,
      productId,
      name: product.name,
      slug: product.slug,
      price: product.price,
      originalPrice: product.originalPrice,
      discountPercent: product.savingsPercent,
      image: product.image,
      packSize: product.packSize,
      unit: product.unit,
      requiresPrescription: product.requiresPrescription,
    },
  );
  const { totalItems, totalPrice } = useCartRead();
  const { slideAnim, opacityAnim } = animations;
  // Shared global CTA height for the counter and View Cart action.
  const FOOTER_CONTROL_HEIGHT = exactScale(50);

  if (hideAddButton && count === 0) return null;

  const priceBlock = (
    <View style={{ flex: 1, marginRight: exactScale(10), minWidth: 0 }}>
      <View
        className="flex-row items-baseline gap-x-1"
        style={{ flexWrap: "wrap" }}
      >
        <Text
          className="font-inter-extrabold text-[#111827]"
          style={{ fontSize: moderateScale(20) }}
        >
          ₹{Number(product.price).toFixed(2)}
        </Text>
        {!!product.originalPrice && product.originalPrice > product.price && (
          <Text
            className="font-inter-medium text-brand-subtext line-through"
            style={{ fontSize: moderateScale(12) }}
          >
            ₹{Number(product.originalPrice).toFixed(2)}
          </Text>
        )}
        {!!product.savingsPercent && (
          <View
            className="px-2 py-0.5 rounded-sm"
            style={{ backgroundColor: "#DBE9FE", position: "relative" }}
          >
            <Text
              className="font-inter-bold"
              style={[{ fontSize: moderateScale(12) }, { color: "#0559E8" }]}
            >
              {product.savingsPercent}% off
            </Text>
            <OfferShine borderRadius={exactScale(2)} />
          </View>
        )}
      </View>
      <Text
        numberOfLines={1}
        ellipsizeMode="tail"
        className="font-inter-medium text-brand-subtext mt-0.5"
        style={{ fontSize: moderateScale(11) }}
      >
        (Inclusive of all Taxes)
      </Text>
    </View>
  );

  return (
    <StickyFooter
      safeAreaBottom={safeAreaBottom}
      style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}
      contentStyle={{
        flexDirection: "row",
        alignItems: "center",
        maxWidth: undefined,
      }}
    >
      {count === 0 ? (
        <>
          {priceBlock}
          <AppButton
            title="Add to Cart"
            onPress={increment}
            disabled={isPending}
            loading={isPending}
            style={{
              flexBasis: "42%",
              minWidth: exactScale(128),
              maxWidth: exactScale(140),
              flexShrink: 0,
            }}
            textClassName="font-inter-bold"
            textStyle={{ fontSize: moderateScale(16) }}
          />
        </>
      ) : (
        <>
          {/* Left — qty counter (outline, mirrors ComparisonBoard) */}
          <View
            className="flex-row items-center border-[1.5px] border-[#E5E7EB] rounded-[10px] bg-white"
            style={{
              width: "34%",
              minWidth: exactScale(100),
              maxWidth: exactScale(120),
              height: FOOTER_CONTROL_HEIGHT,
              opacity: isPending ? 0.55 : 1,
            }}
          >
            <Touchable
              onPress={decrement}
              disabled={isPending}
              accessibilityRole="button"
              accessibilityLabel="Decrease quantity"
              accessibilityState={{ disabled: isPending }}
              activeOpacity={0.7}
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
                width: exactScale(32),
                height: exactScale(24),
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
              activeOpacity={0.7}
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

          {/* Right — cart summary pill (View Cart), fills remaining width */}
          <Touchable
            onPress={onViewCart}
            activeOpacity={0.85}
            className="flex-1 flex-row items-center justify-between bg-brand-primary overflow-hidden"
            style={{
              height: FOOTER_CONTROL_HEIGHT,
              marginLeft: exactScale(12),
              borderRadius: exactScale(10),
              paddingHorizontal: exactScale(10),
              gap: exactScale(6),
            }}
          >
            {/* Price + items */}
            <View
              className="justify-center"
              style={{
                minWidth: exactScale(76),
                paddingLeft: exactScale(4),
                paddingRight: exactScale(6),
              }}
            >
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.75}
                className="font-inter-extrabold text-white"
                style={{ fontSize: moderateScale(15) }}
              >
                ₹{Number(totalPrice).toFixed(2)}
              </Text>
              <Text
                numberOfLines={1}
                className="font-inter-medium"
                style={[
                  { fontSize: moderateScale(11) },
                  { color: "rgba(255,255,255,0.75)" },
                ]}
              >
                {totalItems} Item{totalItems !== 1 ? "s" : ""}
              </Text>
            </View>

            {/* Divider */}
            <View
              style={{
                alignSelf: "center",
                width: 1,
                height: exactScale(28),
                backgroundColor: "rgba(255,255,255,0.3)",
              }}
            />

            {/* View Cart label */}
            <View
              className="justify-center items-center flex-row gap-x-1.5"
              style={{
                flexShrink: 1,
                minWidth: 0,
                paddingLeft: exactScale(6),
              }}
            >
              <Text
                numberOfLines={1}
                className="font-inter-bold text-white"
                style={{ fontSize: moderateScale(15) }}
              >
                View Cart
              </Text>
              <Text
                className="text-white font-inter-bold"
                style={{ fontSize: moderateScale(16) }}
              >
                ›
              </Text>
            </View>
          </Touchable>
        </>
      )}
    </StickyFooter>
  );
});

ProductDetailsFooter.displayName = "ProductDetailsFooter";
