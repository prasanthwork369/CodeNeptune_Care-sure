import { useCart } from "@/src/hooks/queries/useCart";
import { useCartActions } from "@/src/hooks/useCartActions";
import { ProductDetailsFooterProps } from "@/src/types/product";
import { Touchable } from "@/src/components/ui/Touchable";
import React from "react";
import {
    ActivityIndicator,
    Animated,
    Text,
    View,
} from "react-native";

export const ProductDetailsFooter: React.FC<ProductDetailsFooterProps> = ({
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
  const { totalItems, totalPrice } = useCart();
  const { slideAnim, opacityAnim } = animations;

  if (hideAddButton && count === 0) return null;

  const priceBlock = (
    <View style={{ flex: 1, marginRight: 12 }}>
      <View className="flex-row items-baseline gap-x-2" style={{ flexWrap: 'wrap' }}>
        <Text className="text-[20px] font-inter-extrabold text-[#111827]">
          ₹{Number(product.price).toFixed(2)}
        </Text>
        {!!product.originalPrice && product.originalPrice > product.price && (
          <Text className="text-[12px] font-inter-medium text-brand-subtext line-through">
            ₹{Number(product.originalPrice).toFixed(2)}
          </Text>
        )}
        {!!product.savingsPercent && (
          <View
            className="px-2 py-0.5 rounded-sm"
            style={{ backgroundColor: "#DBE9FE" }}
          >
            <Text
              className="text-[12px] font-inter-bold"
              style={{ color: "#0559E8" }}
            >
              {product.savingsPercent}% off
            </Text>
          </View>
        )}
      </View>
      <Text className="text-[11px] font-inter-medium text-brand-subtext mt-0.5">
        (Inclusive of all Taxes)
      </Text>
    </View>
  );

  return (
    <View
      style={{
        paddingBottom: safeAreaBottom + 12,
        shadowColor: "#919EAB33",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 12,
      }}
      className="absolute bottom-0 left-0 right-0 bg-white px-5 pt-3 border-t border-[#F3F4F6] flex-row items-center justify-between"
    >
      {count === 0 ? (
        <>
          {priceBlock}
          <Touchable
            onPress={increment}
            disabled={isPending}
            activeOpacity={0.85}
            className="bg-brand-primary rounded-[12px] px-8 py-3.5 items-center justify-center"
            style={{ minWidth: 140 }}
          >
            {isPending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-[16px] font-inter-bold text-white">
                Add to Cart
              </Text>
            )}
          </Touchable>
        </>
      ) : (
        <>
          {/* Left — qty counter (outline, mirrors ComparisonBoard) */}
          <View
            className="flex-row items-center border-[1.5px] border-[#E5E7EB] rounded-[10px] bg-white h-[42px]"
            style={{ width: 120 }}
          >
            <Touchable
              onPress={decrement}
              disabled={isPending}
              activeOpacity={0.7}
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
              onPress={increment}
              disabled={isPending}
              activeOpacity={0.7}
              className="flex-1 items-center justify-center h-full"
            >
              <Text className="text-[22px] font-inter-semibold text-brand-text">
                +
              </Text>
            </Touchable>
          </View>

          {/* Right — cart summary pill (View Cart) */}
          <Touchable
            onPress={onViewCart}
            activeOpacity={0.85}
            className="flex-row items-center bg-brand-primary rounded-[12px] overflow-hidden"
            style={{ height: 52 }}
          >
            {/* Price + items */}
            <View className="px-4 justify-center" style={{ minWidth: 100 }}>
              <Text className="text-[15px] font-inter-extrabold text-white">
                ₹{Number(totalPrice).toFixed(2)}
              </Text>
              <Text
                className="text-[11px] font-inter-medium"
                style={{ color: "rgba(255,255,255,0.75)" }}
              >
                {totalItems} Item{totalItems !== 1 ? "s" : ""}
              </Text>
            </View>

            {/* Divider */}
            <View
              style={{
                width: 1,
                height: 28,
                backgroundColor: "rgba(255,255,255,0.3)",
              }}
            />

            {/* View Cart label */}
            <View className="px-4 justify-center items-center flex-row gap-x-1.5">
              <Text className="text-[15px] font-inter-bold text-white">
                View Cart
              </Text>
              <Text className="text-white text-[16px] font-inter-bold">›</Text>
            </View>
          </Touchable>
        </>
      )}
    </View>
  );
};
