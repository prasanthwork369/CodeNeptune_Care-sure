import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { MedicineVariant } from "@/src/features/product/hooks/useProduct";
import { useNav } from "@/src/hooks/useNav";
import { exactScale } from "@/src/utils/exactScale";
import React, { useCallback, useState } from "react";
import { Gesture, GestureDetector, type PanGesture } from "react-native-gesture-handler";
import { runOnJS, useSharedValue } from "react-native-reanimated";
import { CarouselDot } from "@/src/components/animations/carousel";
import { ScrollView, Text, useWindowDimensions, View } from "react-native";
import { Image } from "expo-image";
import Carousel from "react-native-reanimated-carousel";
import { styles as s } from "./ProductInfo.styles";

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

export const ProductInfo: React.FC<ProductInfoProps> = React.memo(
  ({
    product,
    variants = [],
    selectedVariantId,
    onVariantSelect,
  }) => {
    const router = useNav();
    const { width } = useWindowDimensions();
    const [, setActiveIndex] = useState(0);
    const progress = useSharedValue(0);
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

    // Release vertical drag immediately to parent ScrollView while preserving horizontal swipe.
    const handleConfigurePanGesture = useCallback((panGesture: PanGesture) => {
      panGesture.activeOffsetX([-10, 10]).failOffsetY([-10, 10]);
    }, []);

    return (
      <View style={s.root}>
        <View style={s.carouselWrap}>
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
            onConfigurePanGesture={handleConfigurePanGesture}
            renderItem={({ item, index }) => {
              const tapGesture = Gesture.Tap()
                .maxDistance(10)
                .onEnd(() => {
                  runOnJS(openImageViewer)(index);
                });

              return (
                <View
                  style={[
                    s.carouselItemContainer,
                    {
                      width,
                      height: imgSize,
                    },
                  ]}
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
            <View style={s.dotsRow}>
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

        <View style={s.contentPad}>
          <Text style={s.manufacturerText}>
            {product.manufacturer}
          </Text>
          <Text style={s.productNameText}>
            {product.name}
          </Text>

          <View style={s.dashedDivider} />

          <View style={s.priceRow}>
            <Text style={s.sellingPriceText}>
              ₹{Number(product.price).toFixed(2)}
            </Text>
            {!!product.originalPrice && product.originalPrice > product.price && (
              <>
                <Text style={s.mrpLabel}>
                  MRP
                </Text>
                <Text style={s.mrpValue}>
                  ₹{Number(product.originalPrice).toFixed(2)}
                </Text>
              </>
            )}
            {!!product.savingsPercent && (
              <Text style={s.savingsText}>
                {product.savingsPercent}% off
              </Text>
            )}
          </View>

          <Text style={s.packLabelText}>
            {product.packLabel ??
              `${product.packSize ?? ""} ${product.dosageForm ?? ""}`.trim()}
            {product.packSize
              ? ` | ₹${(
                  Math.floor((product.price / product.packSize) * 100) / 100
                ).toFixed(2)} / UNIT`
              : ""}{" "}
            <Text style={s.inclusiveTaxesText}>
              (Inclusive of all Taxes)
            </Text>
          </Text>

          {variants.length >= 1 && (
            <View style={s.variantsSection}>
              <Text style={s.selectPackTitle}>
                Select Pack Size
              </Text>
              <ScrollView
                horizontal
                nestedScrollEnabled
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.variantsScrollContent}
              >
                {variants.map((v) => {
                  const isSelected = v.id === selectedVariantId;
                  const sellingPrice = v.price;
                  const packNum = parseFloat(v.packSize);
                  const unitPrice =
                    packNum > 0
                      ? (
                          Math.floor((sellingPrice / packNum) * 100) / 100
                        ).toFixed(2)
                      : null;

                  return (
                    <Touchable
                      key={v.id}
                      onPress={() => onVariantSelect?.(v.id)}
                      activeOpacity={0.8}
                      style={[
                        s.variantCard,
                        isSelected && s.variantCardSelected,
                      ]}
                    >
                      {/* Top — pack size */}
                      <View
                        style={[
                          s.variantTopBox,
                          isSelected && s.variantTopBoxSelected,
                        ]}
                      >
                        <Text
                          numberOfLines={1}
                          ellipsizeMode="tail"
                          style={[
                            s.variantPackSizeText,
                            isSelected && s.variantPackSizeTextSelected,
                          ]}
                        >
                          {v.packSize} {v.unit}
                        </Text>
                      </View>

                      {/* Divider */}
                      <View
                        style={[
                          s.variantDivider,
                          isSelected && s.variantDividerSelected,
                        ]}
                      />

                      {/* Bottom — price + unit price */}
                      <View style={s.variantBottomBox}>
                        <Text style={s.variantPriceText}>
                          ₹{sellingPrice.toFixed(2)}
                        </Text>
                        {unitPrice && (
                          <Text style={s.variantUnitPriceText}>
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
  },
);

ProductInfo.displayName = "ProductInfo";
