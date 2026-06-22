import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { MedicineVariant } from "@/src/hooks/queries/useProduct";
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
  const imgSize = width * 0.55;

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
                  height: 5,
                  width: activeIndex === index ? 18 : 8,
                  borderRadius: 3,
                  backgroundColor:
                    activeIndex === index ? "#009989" : "#E1F0FF",
                }}
              />
            ))}
          </View>
        )}
      </View>

      <View className="px-5">
        <Text className="text-[13px] font-inter-semibold text-[#009989] mb-1">
          {product.manufacturer}
        </Text>
        <Text className="text-[20px] font-inter-bold text-[#111827] mb-3 leading-[28px]">
          {product.name}
        </Text>

        <View className="flex-row items-baseline gap-x-1.5 mb-1">
          <Text className="text-[24px] font-inter-extrabold text-[#111827]">
            ₹{Number(product.price).toFixed(2)}
          </Text>
          {!!product.originalPrice && product.originalPrice > product.price && (
            <>
              <Text className="text-[13px] font-inter-medium text-brand-subtext ml-1">
                MRP
              </Text>
              <Text className="text-[13px] font-inter-medium text-brand-subtext line-through">
                ₹{Number(product.originalPrice).toFixed(2)}
              </Text>
            </>
          )}
          {!!product.savingsPercent && (
            <Text className="text-[14px] font-inter-bold text-[#0F7635] ml-2">
              {product.savingsPercent}% off
            </Text>
          )}
        </View>

        <Text className="text-[12px] font-inter-medium text-brand-subtext uppercase tracking-wider">
          {product.packLabel ??
            `${product.packSize ?? ""} ${product.dosageForm ?? ""}`.trim()}
          {product.packSize
            ? ` | ₹${(product.price / product.packSize).toFixed(2)} / UNIT`
            : ""}{" "}
          <Text className="normal-case tracking-normal text-brand-subtext">
            (Inclusive of all Taxes)
          </Text>
        </Text>

        {variants.length > 1 && (
          <View style={{ marginTop: 16 }}>
            <Text className="text-[12px] font-inter-semibold text-[#6B7280] mb-3 uppercase tracking-wider">
              Select Pack Size
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 10, paddingRight: 4 }}
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
                  packNum > 0 ? (sellingPrice / packNum).toFixed(2) : null;

                return (
                  <Touchable
                    key={v.id}
                    onPress={() => onVariantSelect?.(v.id)}
                    activeOpacity={0.8}
                    style={{
                      width: 120,
                      borderRadius: 12,
                      borderWidth: isSelected ? 1.5 : 1,
                      borderColor: isSelected ? "#0F763580" : "#E5E7EB",
                      backgroundColor: "#FFFFFF",
                      overflow: "hidden",
                    }}
                  >
                    {/* Top — pack size */}
                    <View
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 10,
                        backgroundColor: isSelected ? "#FAFFF3" : "#FAFAFA",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
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
                        paddingHorizontal: 10,
                        paddingVertical: 10,
                        backgroundColor: "#FFFFFF",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 15,
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
                            fontSize: 12,
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
