import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { MedicineVariant } from "@/src/hooks/queries/useProduct";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import React, { useState } from "react";
import {
    Image,
    ScrollView,
    Text,
    useWindowDimensions,
    View,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";

interface ProductInfoProps {
  productId: string;
  medicineUuid?: string;
  product: {
    name: string;
    slug?: string;
    requiresPrescription?: boolean;
    manufacturer: string;
    description: string;
    price: number;
    originalPrice?: number;
    savingsPercent?: number;
    dosageForm?: string;
    packSize?: number;
    packLabel?: string;
    brandName?: string;
    image: any;
    images?: any[];
  };
  variants?: MedicineVariant[];
  selectedVariantId?: string | null;
  onVariantSelect?: (id: string) => void;
}

export const ProductInfo: React.FC<ProductInfoProps> = ({
  productId,
  medicineUuid,
  product,
  variants = [],
  selectedVariantId,
  onVariantSelect,
}) => {
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  // 0.55 * Figma's 390px baseline, scaled the same way as the rest of the
  // app (capped at 1.15x) so this doesn't grow unbounded on large screens.
  const imgSize = exactScale(215);

  const carouselImages = product.images?.length
    ? product.images
    : [product.image];

  return (
    <View className="bg-transparent pt-4 pb-4">
      <View className="mb-8">
        <Carousel
          width={width}
          height={imgSize}
          data={carouselImages}
          autoPlay={carouselImages.length > 1}
          autoPlayInterval={3000}
          loop={carouselImages.length > 1}
          onSnapToItem={setActiveIndex}
          renderItem={({ item }) => (
            <View
              style={{
                width,
                height: imgSize,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {item ? (
                <Image
                  source={item}
                  style={{ width: imgSize, height: imgSize }}
                  resizeMode="contain"
                />
              ) : (
                <icons.placeholder
                  width={imgSize * 0.7}
                  height={imgSize * 0.7}
                />
              )}
            </View>
          )}
        />
        {carouselImages.length > 1 && (
          <View className="flex-row items-center justify-center mt-4 gap-x-1.5">
            {carouselImages.map((_, index) => (
              <View
                key={index}
                style={{
                  height: exactScale(5),
                  width: activeIndex === index ? exactScale(18) : exactScale(8),
                  borderRadius: exactScale(3),
                  backgroundColor:
                    activeIndex === index ? "#009989" : "#E1F0FF",
                }}
              />
            ))}
          </View>
        )}
      </View>

      <View className="px-5">
        <Text className="font-inter-semibold text-[#009989] mb-1" style={{ fontSize: moderateScale(13, 0.1) }}>
          {product.manufacturer}
        </Text>
        <Text className="font-inter-bold text-[#111827] mb-3" style={{ fontSize: moderateScale(20, 0.1), lineHeight: moderateScale(28, 0.1) }}>
          {product.name}
        </Text>

        <View style={{ borderTopWidth: 1, borderColor: '#E5E7EB', borderStyle: 'dashed', marginBottom: 12 }} />

        <View className="flex-row items-baseline gap-x-1.5 mb-1">
          <Text className="font-inter-extrabold text-[#111827]" style={{ fontSize: moderateScale(24, 0.1) }}>
            ₹{Number(product.price).toFixed(2)}
          </Text>
          {!!product.originalPrice && product.originalPrice > product.price && (
            <>
              <Text className="font-inter-medium text-brand-subtext ml-1" style={{ fontSize: moderateScale(13, 0.1) }}>
                MRP
              </Text>
              <Text className="font-inter-medium text-brand-subtext line-through" style={{ fontSize: moderateScale(13, 0.1) }}>
                ₹{Number(product.originalPrice).toFixed(2)}
              </Text>
            </>
          )}
          {!!product.savingsPercent && (
            <Text className="font-inter-bold text-[#0F7635] ml-2" style={{ fontSize: moderateScale(14, 0.1) }}>
              {product.savingsPercent}% off
            </Text>
          )}
        </View>

        <Text className="font-inter-medium text-brand-subtext uppercase tracking-wider" style={{ fontSize: moderateScale(12, 0.1) }}>
          {product.packLabel ??
            `${product.packSize ?? ""} ${product.dosageForm ?? ""}`.trim()}
          {product.packSize
            ? ` | ₹${(
                // Use Math.floor to truncate trailing decimals, preventing rounding up (e.g. 199.50/200 = 0.99)
                Math.floor((product.price / product.packSize) * 100) / 100
              ).toFixed(2)} / UNIT`
            : ""}{" "}
          <Text className="normal-case tracking-normal text-brand-subtext">
            (Inclusive of all Taxes)
          </Text>
        </Text>

        {variants.length > 1 && (
          <View style={{ marginTop: exactScale(16) }}>
            <Text className="font-inter-semibold text-[#6B7280] mb-3 uppercase tracking-wider" style={{ fontSize: moderateScale(12, 0.1) }}>
              Select Pack Size
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: exactScale(10), paddingRight: exactScale(4) }}
            >
              {variants.map((v) => {
                const isSelected = v.id === selectedVariantId;
                const discountPct = product.savingsPercent ?? 0;
                // v.price is MRP; selling price = MRP * (1 - discount%)
                const sellingPrice =
                  discountPct > 0
                    ? parseFloat((v.price * (1 - discountPct / 100)).toFixed(2))
                    : v.price;
                const mrp = discountPct > 0 ? v.price.toFixed(0) : null;
                const packNum = parseFloat(v.packSize);
                const unitPrice =
                  packNum > 0
                    ? (
                        // Use Math.floor to truncate trailing decimals, preventing rounding up (e.g. 199.50/200 = 0.99)
                        Math.floor((sellingPrice / packNum) * 100) / 100
                      ).toFixed(2)
                    : null;

                return (
                  <Touchable
                    key={v.id}
                    onPress={() => onVariantSelect?.(v.id)}
                    activeOpacity={0.8}
                    style={{
                      width: exactScale(120),
                      borderRadius: exactScale(12),
                      borderWidth: isSelected ? 1.5 : 1,
                      borderColor: isSelected ? "#0F763580" : "#E5E7EB",
                      backgroundColor: "#FFFFFF",
                      overflow: "hidden",
                    }}
                  >
                    {/* Top — pack size */}
                    <View
                      style={{
                        paddingHorizontal: exactScale(10),
                        paddingVertical: exactScale(10),
                        backgroundColor: isSelected ? "#FAFFF3" : "#FAFAFA",
                      }}
                    >
                      <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={{
                          fontSize: moderateScale(14, 0.1),
                          fontWeight: "600",
                          color: isSelected ? "#0F7635" : "#9CA3AF",
                        }}
                      >
                        {v.packSize} {v.unit}
                      </Text>
                    </View>

                    {/* Divider */}
                    <View
                      style={{
                        height: 1,
                        backgroundColor: isSelected ? "#0F763530" : "#E5E7EB",
                      }}
                    />

                    {/* Bottom — price + unit price (always white) */}
                    <View
                      style={{
                        paddingHorizontal: exactScale(10),
                        paddingVertical: exactScale(10),
                        backgroundColor: "#FFFFFF",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: moderateScale(15, 0.1),
                          fontWeight: "700",
                          color: "#111827",
                          marginBottom: 2,
                        }}
                      >
                        ₹{sellingPrice.toFixed(2)}
                      </Text>
                      {unitPrice && (
                        <Text
                          style={{
                            fontSize: moderateScale(12, 0.1),
                            fontWeight: "400",
                            color: "#6B7280",
                          }}
                        >
                          ₹{unitPrice}/{v.unit}
                        </Text>
                      )}
                    </View>
                  </Touchable>
                );
              })}
            </ScrollView>
          </View>
        )}
      </View>
    </View>
  );
};
