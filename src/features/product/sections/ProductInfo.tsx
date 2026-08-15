import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { MedicineVariant } from "@/src/hooks/queries/useProduct";
import { useNav } from "@/src/hooks/useNav";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import React, { useState } from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS, useSharedValue } from "react-native-reanimated";
import { CarouselDot } from "@/src/components/animations/carousel";
import { ScrollView, Text, useWindowDimensions, View } from "react-native";
import { Image } from "expo-image";
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
    image?: { uri: string };
    images?: { uri: string }[];
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
  const router = useNav();
  const { width } = useWindowDimensions();
  const [, setActiveIndex] = useState(0);
  const progress = useSharedValue(0);
  // 0.55 * Figma's 390px baseline, scaled the same way as the rest of the
  // app (capped at 1.15x) so this doesn't grow unbounded on large screens.
  const imgSize = exactScale(215);

  const carouselImages = product.images?.length
    ? product.images
    : [product.image];

  const openImageViewer = (index: number) => {
    const uris = carouselImages
      .map((img) => img?.uri)
      .filter((uri): uri is string => !!uri);
    if (!uris.length) return;
    router.push({
      pathname: "/product/image-viewer",
      params: {
        imageUrls: JSON.stringify(uris),
        initialIndex: String(index),
        productName: product.name,
      },
    });
  };

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
          onProgressChange={(_, absoluteProgress) => {
            progress.value = absoluteProgress;
          }}
          renderItem={({ item, index }) => {
            // A plain Touchable here (RN's legacy responder system) fights
            // the carousel's own gesture-handler-based pan for the swipe —
            // a Tap gesture with a tight maxDistance fails fast on real
            // swipe motion instead, so the carousel still owns the drag.
            const tapGesture = Gesture.Tap()
              .maxDistance(10)
              .onEnd(() => {
                runOnJS(openImageViewer)(index);
              });

            return (
              <View
                style={{
                  width,
                  height: imgSize,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {item ? (
                  <GestureDetector gesture={tapGesture}>
                    <View>
                      <Image
                        source={item}
                        style={{ width: imgSize, height: imgSize }}
                        contentFit="contain"
                        cachePolicy="memory-disk"
                      />
                    </View>
                  </GestureDetector>
                ) : (
                  <icons.placeholder
                    width={imgSize * 0.7}
                    height={imgSize * 0.7}
                  />
                )}
              </View>
            );
          }}
        />
        {carouselImages.length > 0 && (
          <View className="flex-row items-center justify-center mt-4 gap-x-1.5">
            {carouselImages.map((_, index) => (
              <CarouselDot
                key={index}
                index={index}
                progress={progress}
                total={carouselImages.length}
              />
            ))}
          </View>
        )}
      </View>

      <View className="px-5">
        <Text
          className="font-inter-semibold text-[#009989] mb-1"
          style={{ fontSize: moderateScale(13) }}
        >
          {product.manufacturer}
        </Text>
        <Text
          className="font-inter-bold text-[#111827] mb-3"
          style={[
            { fontSize: moderateScale(20) },
            { lineHeight: moderateScale(28) },
          ]}
        >
          {product.name}
        </Text>

        <View
          style={{
            borderTopWidth: 1,
            borderColor: "#E5E7EB",
            borderStyle: "dashed",
            marginBottom: 12,
          }}
        />

        <View className="flex-row items-baseline gap-x-1.5 mb-1">
          <Text
            className="font-inter-extrabold text-[#111827]"
            style={{ fontSize: moderateScale(24) }}
          >
            ₹{Number(product.price).toFixed(2)}
          </Text>
          {!!product.originalPrice && product.originalPrice > product.price && (
            <>
              <Text
                className="font-inter-medium text-brand-subtext ml-1"
                style={{ fontSize: moderateScale(13) }}
              >
                MRP
              </Text>
              <Text
                className="font-inter-medium text-brand-subtext line-through"
                style={{ fontSize: moderateScale(13) }}
              >
                ₹{Number(product.originalPrice).toFixed(2)}
              </Text>
            </>
          )}
          {!!product.savingsPercent && (
            <Text
              className="font-inter-bold text-[#0F7635] ml-2"
              style={{ fontSize: moderateScale(14) }}
            >
              {product.savingsPercent}% off
            </Text>
          )}
        </View>

        <Text
          className="font-inter-medium text-brand-subtext uppercase tracking-wider"
          style={{ fontSize: moderateScale(12) }}
        >
          {product.packLabel ??
            `${product.packSize ?? ""} ${product.dosageForm ?? ""}`.trim()}
          {product.packSize
            ? ` | ₹${
                // Use Math.floor to truncate trailing decimals, preventing rounding up (e.g. 199.50/200 = 0.99)
                (
                  Math.floor((product.price / product.packSize) * 100) / 100
                ).toFixed(2)
              } / UNIT`
            : ""}{" "}
          <Text className="normal-case tracking-normal text-brand-subtext">
            (Inclusive of all Taxes)
          </Text>
        </Text>

        {/* Show the pack-size selector whenever variants exist — including a
            single variant — to match the web PDP (which renders the pack list
            regardless of count). Previously gated on > 1, so single-variant
            products showed no selector on mobile. */}
        {variants.length >= 1 && (
          <View style={{ marginTop: exactScale(16) }}>
            <Text
              className="font-inter-semibold text-[#6B7280] mb-3 uppercase tracking-wider"
              style={{ fontSize: moderateScale(12) }}
            >
              Select Pack Size
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                gap: exactScale(10),
                paddingRight: exactScale(4),
              }}
            >
              {variants.map((v) => {
                const isSelected = v.id === selectedVariantId;
                // v.price is ALREADY the discounted selling price — never re-apply
                // the discount here (that double-discounts the pack-size price).
                const sellingPrice = v.price;
                const packNum = parseFloat(v.packSize);
                const unitPrice =
                  packNum > 0
                    ? // Use Math.floor to truncate trailing decimals, preventing rounding up (e.g. 199.50/200 = 0.99)
                      (
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
                          fontSize: moderateScale(14),
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
                          fontSize: moderateScale(15),
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
                            fontSize: moderateScale(12),
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
