import {
    LocationBottomSheet,
    WhyFamiliesTrustUs,
} from "@/src/components/home/sections";
import { ProductSkeleton } from "@/src/components/product/ProductSkeleton";
import { useProductHeroAnimation } from "@/src/hooks/animations/useProductHeroAnimation";
import { useCart } from "@/src/hooks/queries/useCart";
import { useHome } from "@/src/hooks/queries/useHome";
import { useProduct } from "@/src/hooks/queries/useProduct";
import { useNav } from "@/src/hooks/useNav";
import { formatPackLabel } from "@/src/utils/packLabel";
import { exactScale } from "@/src/utils/exactScale";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { moderateScale } from "@/src/utils/exactScale";
import {
    KnowYourMedicine,
    LogisticsBar,
    MoreAboutSection,
    NoSubstituteBanner,
    ProductDetailsFooter,
    ProductDetailsHeader,
    ProductInfo,
    SaltCompositionBanner,
    TrustBadge,
} from "./sections";

// Backend doesn't yet distinguish "checked, no substitute exists" from
// "recommendation just not populated for this product" -- showing the
// banner on every empty recommendation would be misleading. Flip to true
// once the API guarantees that signal.
const SHOW_NO_SUBSTITUTE_BANNER = false;

export const ProductDetailsLayout: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useNav();
  const adjustedBottom = useAdjustedBottomInset();
  const { product, recommendation, saltComposition, variants, raw, isLoading } =
    useProduct(id);
  const { items: cartItems } = useCart();
  const { appContent, isLoading: isHomeLoading } = useHome();

  const [locationSheetVisible, setLocationSheetVisible] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null,
  );

  // Preselect whichever variant is already in the cart (each variant UUID is
  // its own cart row — see useCartActions), so "Add to Cart" reflects the
  // actual cart state no matter which variant the user added from elsewhere
  // (search results, recommend cards, etc.). Falls back to the first variant.
  //
  // Search-comparison flows add the recommendation's own id (not a variant
  // UUID from this product's variants list) as medicineId — so also match by
  // the packSize/unit stored in cart metadata to find the right variant.
  useEffect(() => {
    if (variants.length > 0 && !selectedVariantId) {
      const inCart = variants.find((v) =>
        cartItems.some(
          (i) =>
            i.medicineId === v.id ||
            (i.metadata?.packSize === v.packSize &&
              i.metadata?.unit === v.unit),
        ),
      );
      setSelectedVariantId((inCart ?? variants[0]).id);
    }
  }, [variants, cartItems]);

  const selectedVariant =
    variants.find((v) => v.id === selectedVariantId) ?? variants[0] ?? null;

  // Merge selected variant price into product for footer/cart
  // selectedVariant.price = MRP; selling price = MRP * (1 - discount%)
  const effectiveDiscountPct = selectedVariant
    ? selectedVariant.discountPercentage > 0
      ? selectedVariant.discountPercentage
      : (product?.savingsPercent ?? 0)
    : 0;
  const variantSellingPrice = selectedVariant
    ? effectiveDiscountPct > 0
      ? parseFloat(
          (selectedVariant.price * (1 - effectiveDiscountPct / 100)).toFixed(2),
        )
      : selectedVariant.price
    : 0;
  const activeProduct =
    product && selectedVariant
      ? {
          ...product,
          price: variantSellingPrice,
          originalPrice:
            effectiveDiscountPct > 0 ? selectedVariant.price : undefined,
          savingsPercent:
            effectiveDiscountPct > 0 ? effectiveDiscountPct : undefined,
          packSize: parseFloat(selectedVariant.packSize) || product.packSize,
          packLabel: formatPackLabel({
            packSize: selectedVariant.packSize,
            unit: selectedVariant.unit,
            dosageForm: product.dosageForm,
          }),
        }
      : product;

  // When a variant is selected, use the VARIANT's UUID as medicineId.
  // The backend cart unique-key is medicineId only — different variant UUIDs = separate rows.
  const medicineId = selectedVariant?.id ?? raw?.id;
  const activeVariantId = selectedVariant?.id ?? null;

  const goBack = useCallback(() => router.back(), [router]);
  const {
    containerStyle,
    contentStyle,
    backdropStyle,
    screenStyle,
    handleBack,
  } = useProductHeroAnimation(goBack);

  const manufacturer = raw?.manufacturer?.name ?? raw?.brand?.name ?? "";
  const medicineName = raw?.name ?? "";

  const recPackSize = raw?.recommendation?.packSize
    ? parseInt(String(raw.recommendation.packSize).match(/\d+/)?.[0] ?? "1")
    : 1;
  const recUnitPrice = recommendation
    ? (
        // Use Math.floor to truncate trailing decimals, preventing rounding up (e.g. 199.50/200 = 0.99)
        Math.floor((recommendation.price / Math.max(recPackSize, 1)) * 100) / 100
      ).toFixed(2)
    : undefined;

  return (
    <Animated.View
      style={[{ flex: 1, backgroundColor: "#FFFFFF" }, screenStyle]}
    >
      {/* Dims home screen during expansion */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: "rgba(0,0,0,0.15)" },
          backdropStyle,
        ]}
        pointerEvents="none"
      />

      {/* Expanding container — grows from card rect to full screen, clips content */}
      <Animated.View style={[{ backgroundColor: "#FFFFFF" }, containerStyle]}>
        <Animated.View style={contentStyle}>
          <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
            <LinearGradient
              colors={["#EAF7D6", "rgba(234, 247, 214, 0)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: exactScale(180),
              }}
            />

            <ProductDetailsHeader title={medicineName} onBack={handleBack} />

            {isLoading ? (
              <ProductSkeleton />
            ) : !product ? (
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  paddingHorizontal: 32,
                }}
              >
                <Text
                  style={{
                    fontSize: moderateScale(16),
                    fontWeight: "600",
                    color: "#333232",
                    textAlign: "center",
                  }}
                >
                  Product not found
                </Text>
              </View>
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: adjustedBottom + 80 }}
                style={{ flex: 1 }}
                bounces={false}
                overScrollMode="never"
              >
                {saltComposition && (
                  <SaltCompositionBanner composition={saltComposition} />
                )}

                <ProductInfo
                  productId={id}
                  medicineUuid={medicineId}
                  product={activeProduct!}
                  variants={variants}
                  selectedVariantId={selectedVariantId}
                  onVariantSelect={setSelectedVariantId}
                />

                <LogisticsBar
                  onChangeLocation={() => setLocationSheetVisible(true)}
                />

                {recommendation && (
                  <TrustBadge
                    searchedName={product.name}
                    recommendedName={recommendation?.name}
                    searchedManufacturer={product.manufacturer}
                    recommendedManufacturer={recommendation?.manufacturer}
                    searchedUnitPrice={product.unitPriceDisplay}
                    recommendedUnitPrice={recUnitPrice}
                  />
                )}

                <KnowYourMedicine manufacturer={manufacturer} />

                <WhyFamiliesTrustUs
                  promise={appContent?.promise}
                  isLoading={isHomeLoading}
                  showTitle={false}
                />

                <MoreAboutSection
                  medicineName={medicineName}
                  mobileAdditionalData={raw?.mobileAdditionalData}
                />
              </ScrollView>
            )}

            {activeProduct && (recommendation || !SHOW_NO_SUBSTITUTE_BANNER ? (
              <ProductDetailsFooter
                productId={id}
                medicineUuid={medicineId}
                // Only fall back to base-product matching for
                // variant-less products. For products with
                // variants, baseMedicineId is identical across
                // all variants — matching on it would make the
                // footer show "in cart" for every variant once
                // any one of them (or the base id itself) is
                // in the cart.
                baseMedicineId={variants.length > 0 ? undefined : raw?.id}
                variantId={activeVariantId}
                product={{
                  ...activeProduct,
                  packSize: selectedVariant
                    ? `${selectedVariant.packSize} ${selectedVariant.unit}`
                    : activeProduct.packSize != null
                      ? String(activeProduct.packSize)
                      : undefined,
                  unit: selectedVariant?.unit,
                }}
                safeAreaBottom={adjustedBottom}
                onViewCart={() => router.push("/(modal)/cart")}
              />
            ) : (
              <NoSubstituteBanner
                productId={id}
                medicineUuid={medicineId}
                productName={activeProduct.name}
                safeAreaBottom={adjustedBottom}
              />
            ))}
          </View>
        </Animated.View>
      </Animated.View>

      {/* Outside expanding container so modal renders above animation */}
      <LocationBottomSheet
        isVisible={locationSheetVisible}
        onClose={() => setLocationSheetVisible(false)}
      />
    </Animated.View>
  );
};
