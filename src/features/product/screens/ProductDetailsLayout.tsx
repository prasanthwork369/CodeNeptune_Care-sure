import { WhyFamiliesTrustUs } from "@/src/components/common/WhyFamiliesTrustUs";
import { LocationBottomSheet } from "@/src/components/location/LocationBottomSheet";
import { ProductSkeleton } from "@/src/features/product/ProductSkeleton";
import { useMoreAboutScrollNavigation } from "@/src/features/product/hooks/useMoreAboutScrollNavigation";
import { useInCartVariantId } from "@/src/features/cart/hooks/useCartRead";
import { useAppContent } from "@/src/features/home/hooks/useHome";
import { useProduct, getPackDivisor } from "@/src/features/product/hooks/useProduct";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { useNav } from "@/src/hooks/useNav";
import {
  analyticsService,
  PERF_TRACES,
  usePerformanceTrace,
} from "@/src/services/firebase";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { formatPackLabel } from "@/src/utils/packLabel";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import {
  KnowYourMedicine,
  LogisticsBar,
  NoSubstituteBanner,
  ProductDetailsFooter,
  ProductDetailsHeader,
  ProductInfo,
  SaltCompositionBanner,
  ScrollableMoreAboutContent,
  StickyMoreAboutTabs,
  TrustBadge,
} from "@/src/features/product/sections";

export const ProductDetailsLayout: React.FC = () => {
  // Backend doesn't yet distinguish "checked, no substitute exists" from
  // "recommendation just not populated for this product" -- showing the
  // banner on every empty recommendation would be misleading. Only show it
  // when the user arrived here specifically from a SearchNoSubstituteCard
  // tap (which already confirmed no substitute via its own sourceType/
  // recommendation check), not on every product details page visit.
  const {
    id,
    fromNoSubstitute,
    previewName,
    previewImage,
    previewBrand,
  } = useLocalSearchParams<{
    id: string;
    fromNoSubstitute?: string;
    previewName?: string;
    previewImage?: string;
    previewBrand?: string;
  }>();
  const showNoSubstituteBanner = fromNoSubstitute === "true";
  const router = useNav();
  const adjustedBottom = useAdjustedBottomInset();
  const { product, recommendation, saltComposition, variants, raw, isLoading } =
    useProduct(id);
  const inCartVariantId = useInCartVariantId(variants);
  const { data: appContent, isLoading: isContentLoading } = useAppContent();

  usePerformanceTrace({
    traceName: PERF_TRACES.PRODUCT_DETAILS_LOAD,
    isLoading,
  });

  // Depend on the route id + whether product has loaded, not the `product`
  // object itself, so this fires once per product view instead of on every
  // re-render (variant tap, location-sheet toggle, etc.) that touches it.
  useEffect(() => {
    if (product) void analyticsService.logProductView(raw?.sourceType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, !!product]);

  const mainScrollRef = React.useRef<ScrollView>(null);
  const [locationSheetVisible, setLocationSheetVisible] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null,
  );

  // Preselect whichever variant is already in the cart, falling back to first.
  useEffect(() => {
    if (variants.length > 0 && !selectedVariantId) {
      setSelectedVariantId(inCartVariantId ?? variants[0].id);
    }
  }, [variants, selectedVariantId, inCartVariantId]);

  const selectedVariant = useMemo(
    () =>
      variants.find((v) => v.id === selectedVariantId) ?? variants[0] ?? null,
    [variants, selectedVariantId],
  );

  // Merge selected variant price and pack metadata into a stable product object.
  const activeProduct = useMemo(() => {
    if (!product) return null;
    if (!selectedVariant) return product;

    const effectiveDiscountPct =
      selectedVariant.discountPercentage > 0
        ? selectedVariant.discountPercentage
        : (product.savingsPercent ?? 0);
    const variantSellingPrice = selectedVariant.price;
    const variantMrp = selectedVariant.mrp ?? selectedVariant.price;

    return {
      ...product,
      price: variantSellingPrice,
      originalPrice:
        variantMrp > variantSellingPrice ? variantMrp : undefined,
      savingsPercent:
        effectiveDiscountPct > 0 ? effectiveDiscountPct : undefined,
      packSize: parseFloat(selectedVariant.packSize) || product.packSize,
      packLabel: formatPackLabel({
        packSize: selectedVariant.packSize,
        unit: selectedVariant.unit,
        dosageForm: product.dosageForm,
      }),
    };
  }, [product, selectedVariant]);

  const footerProduct = useMemo(() => {
    if (!activeProduct) return null;
    return {
      ...activeProduct,
      packSize: selectedVariant
        ? `${selectedVariant.packSize} ${selectedVariant.unit}`
        : activeProduct.packSize != null
          ? String(activeProduct.packSize)
          : undefined,
      unit: selectedVariant?.unit,
    };
  }, [activeProduct, selectedVariant]);

  // When a variant is selected, use the VARIANT's UUID as medicineId.
  // The backend cart unique-key is medicineId only — different variant UUIDs = separate rows.
  const medicineId = selectedVariant?.id ?? raw?.id;
  const activeVariantId = selectedVariant?.id ?? null;

  const goBack = useCallback(() => router.back(), [router]);

  const manufacturer =
    raw?.manufacturer?.name ?? raw?.brand?.name ?? previewBrand ?? "";
  const medicineName = raw?.name ?? previewName ?? "";
  const moreAboutNavigation = useMoreAboutScrollNavigation(
    raw?.additionalData,
    mainScrollRef,
  );

  const recPackSize = getPackDivisor(
    recommendation?.packSize,
    recommendation?.unit,
  );
  const recUnitPrice = recommendation
    ? // Use Math.floor to truncate trailing decimals, preventing rounding up (e.g. 199.50/200 = 0.99)
      (
        Math.floor((recommendation.price / Math.max(recPackSize, 1)) * 100) /
        100
      ).toFixed(2)
    : undefined;

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
        <View style={{ flex: 1 }}>
          {/* Header gradient removed per design — keep solid white background */}

          <ProductDetailsHeader
            title={medicineName}
            onBack={goBack}
            productId={id}
            productType={product?.productType}
            slug={product?.slug}
            packLabel={activeProduct?.packLabel}
            price={activeProduct?.price}
            manufacturer={manufacturer}
            dosageForm={product?.dosageForm}
          />

          {isLoading ? (
            <ProductSkeleton
              previewName={previewName}
              previewImage={previewImage}
              previewBrand={previewBrand}
            />
          ) : !product ? (
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: exactScale(32),
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
            <View style={{ flex: 1 }}>
              <ScrollView
                ref={mainScrollRef}
                nestedScrollEnabled
                onScroll={moreAboutNavigation.handleScroll}
                onScrollBeginDrag={moreAboutNavigation.handleScrollBeginDrag}
                scrollEventThrottle={16}
                removeClippedSubviews={false}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: adjustedBottom + 80 }}
                style={{ flex: 1 }}
                overScrollMode="auto"
              >
                <View>
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
                    isLoading={isContentLoading}
                    showTitle={false}
                  />
                </View>
                <ScrollableMoreAboutContent
                  medicineName={medicineName}
                  navigation={moreAboutNavigation}
                />
              </ScrollView>
              <StickyMoreAboutTabs navigation={moreAboutNavigation} />
            </View>
          )}

          {activeProduct &&
            footerProduct &&
            (recommendation || !showNoSubstituteBanner ? (
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
                product={footerProduct}
                safeAreaBottom={adjustedBottom}
                onViewCart={() => router.push("/(commerce)/cart")}
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
      </View>

      <LocationBottomSheet
        isVisible={locationSheetVisible}
        onClose={() => setLocationSheetVisible(false)}
      />
    </View>
  );
};
