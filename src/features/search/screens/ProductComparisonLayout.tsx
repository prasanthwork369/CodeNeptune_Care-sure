import { WhyFamiliesTrustUs } from "@/src/components/common/WhyFamiliesTrustUs";
import { LocationBottomSheet } from "@/src/components/location/LocationBottomSheet";
import { NoInternetState } from "@/src/components/ui/NoInternetState";
import { RetryState } from "@/src/components/ui/RetryState";
import {
  KnowYourMedicine,
  LogisticsBar,
  ProductDetailsFooter,
  SaltCompositionBanner,
  ScrollableMoreAboutContent,
  StickyMoreAboutTabs,
  TrustBadge,
} from "@/src/features/product/sections";
import { ProductHeader } from "@/src/features/search/comparison/components/ProductHeader";
import { ComparisonBoard } from "@/src/features/search/comparison/components/ComparisonBoard";
import { ProductDetailsSkeleton } from "@/src/features/search/comparison/components/ProductDetailsSkeleton";
import { useMoreAboutScrollNavigation } from "@/src/features/product/hooks/useMoreAboutScrollNavigation";
import { useCartRead } from "@/src/features/cart/hooks/useCartRead";
import { useHome } from "@/src/features/home/hooks/useHome";
import { useProduct, getPackDivisor } from "@/src/features/product/hooks/useProduct";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { useLiveScreenState } from "@/src/hooks/ui/useLiveScreenState";
import { useNav } from "@/src/hooks/useNav";
import { useLocationStore } from "@/src/store/locationStore";
import { RecommendedProduct, SearchedProduct } from "@/src/features/search/types";
import { moderateScale } from "@/src/utils/exactScale";
import React, { useCallback, useState } from "react";
import { ScrollView, Text, View } from "react-native";

interface ProductComparisonLayoutProps {
  id: string;
}

export const ProductComparisonLayout: React.FC<
  ProductComparisonLayoutProps
> = ({ id }) => {
  const router = useNav();
  const adjustedBottom = useAdjustedBottomInset();
  const [locationSheetVisible, setLocationSheetVisible] = useState(false);

  const mainScrollRef = React.useRef<ScrollView>(null);
  const goBack = useCallback(() => router.back(), [router]);

  const {
    product,
    recommendation,
    saltComposition,
    raw,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useProduct(id);
  // Same as Product Details: this screen compares live prices and leads to the
  // cart, so offline replaces it rather than comparing cached ones. A failed
  // load must also never read as "no substitute exists".
  const liveState = useLiveScreenState({
    error,
    hasData: !!product,
    loading: isLoading,
  });
  const { appContent, isLoading: isHomeLoading } = useHome();
  const { items: cartItems, totalItems: cartCount } = useCartRead();
  const storePincode = useLocationStore((s) => s.pincode);

  const recMedicineId = recommendation?.id ?? raw?.id;
  const isRecommendedInCart =
    !!recMedicineId && cartItems.some((i) => i.medicineId === recMedicineId);

  const searched: SearchedProduct | null = product
    ? {
        image: product.image,
        name: product.name,
        manufacturer: product.brandName ?? product.manufacturer,
        description: product.packLabel ?? product.description,
        price: product.price,
        priceDisplay: product.priceDisplay,
        unitPrice: product.price / (product.packSize || 1),
        unitPriceDisplay: product.unitPriceDisplay,
        status: "Not for Purchase",
      }
    : null;

  const recommended: RecommendedProduct | null = recommendation
    ? {
        image: recommendation.image,
        name: recommendation.name,
        manufacturer: recommendation.manufacturer,
        description: recommendation.description,
        savingsPercent: recommendation.savingsPercent,
        price: recommendation.price,
        priceDisplay: recommendation.priceDisplay,
        originalPrice: recommendation.originalPrice,
        mrpDisplay: recommendation.mrpDisplay,
        packSize: recommendation.packSize,
        unit: recommendation.unit,
      }
    : searched
      ? {
          image: searched.image,
          name: searched.name,
          manufacturer: searched.manufacturer,
          description: searched.description,
          savingsPercent: 0,
          price: searched.price,
          priceDisplay: String(searched.priceDisplay),
          originalPrice: searched.price,
          mrpDisplay: String(searched.priceDisplay),
        }
      : null;

  const manufacturer = raw?.manufacturer?.name ?? product?.manufacturer ?? "";
  const medicineName = raw?.name ?? "";
  const moreAboutNavigation = useMoreAboutScrollNavigation(
    raw?.additionalData,
    mainScrollRef,
  );

  const recPackSize = raw?.recommendation
    ? getPackDivisor(raw.recommendation.packSize, raw.recommendation.unit)
    : 1;

  const recUnitPrice = recommendation
    ? // Use Math.floor to truncate trailing decimals, preventing rounding up (e.g. 199.50/200 = 0.99)
      (
        Math.floor((recommendation.price / Math.max(recPackSize, 1)) * 100) /
        100
      ).toFixed(2)
    : undefined;

  // Early return for the same reason as ProductDetailsLayout: the sticky
  // ProductDetailsFooter is a sibling of the branch below, so gating only the
  // middle left a live cart footer over the offline state.
  if (liveState) {
    return (
      <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
        <ProductHeader
          query={raw?.name ?? ""}
          cartCount={cartCount}
          isSearching={true}
          onBack={goBack}
        />
        {liveState === "offline" ? (
          <NoInternetState
            onRetry={() => void refetch()}
            retrying={isFetching}
          />
        ) : (
          <RetryState onRetry={() => void refetch()} retrying={isFetching} />
        )}
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
        {/* Header gradient removed to match ProductDetailsLayout */}

        <ProductHeader
          query={raw?.name ?? ""}
          cartCount={cartCount}
          isSearching={true}
          onBack={goBack}
        />

        {isLoading ? (
          <ProductDetailsSkeleton />
        ) : !searched || !recommended ? (
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
          <View style={{ flex: 1 }}>
            <ScrollView
              ref={mainScrollRef}
              nestedScrollEnabled
              onScroll={moreAboutNavigation.handleScroll}
              onScrollBeginDrag={moreAboutNavigation.handleScrollBeginDrag}
              scrollEventThrottle={16}
              removeClippedSubviews={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                // Without this, the comparison cards sit flush against the
                // search bar above whenever there's no salt composition banner.
                paddingBottom: isRecommendedInCart
                  ? adjustedBottom + 100
                  : adjustedBottom + 24,
              }}
              style={{ flex: 1 }}
              overScrollMode="auto"
            >
              {saltComposition && (
                <SaltCompositionBanner composition={saltComposition} />
              )}

              <ComparisonBoard
                searched={searched}
                recommended={recommended}
                productId={recommendation?.productId ?? id}
                medicineUuid={recommendation?.id ?? raw?.id}
                slug={recommendation?.slug ?? raw?.slug}
                requiresPrescription={raw?.requiresPrescription}
              />

              <LogisticsBar
                pincode={storePincode ?? undefined}
                onChangeLocation={() => setLocationSheetVisible(true)}
              />

              {recommendation && (
                <TrustBadge
                  searchedName={searched.name}
                  recommendedName={recommended.name}
                  searchedManufacturer={searched.manufacturer}
                  recommendedManufacturer={recommended.manufacturer}
                  searchedUnitPrice={searched.unitPriceDisplay}
                  recommendedUnitPrice={recUnitPrice}
                />
              )}

              <KnowYourMedicine
                manufacturer={manufacturer}
                returnPolicy={
                  product?.isReturnable ? "Returnable" : "Not Returnable"
                }
              />
              <View style={{ backgroundColor: "#FFFFFF" }}>
                <WhyFamiliesTrustUs
                  promise={appContent?.promise}
                  isLoading={isHomeLoading}
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

        {recommended && (
          <ProductDetailsFooter
            productId={recommendation?.productId ?? id}
            medicineUuid={recommendation?.id ?? raw?.id}
            product={{
              name: recommended.name,
              price: recommended.price,
              originalPrice: recommended.originalPrice,
              savingsPercent: recommended.savingsPercent ?? undefined,
              requiresPrescription: raw?.requiresPrescription,
            }}
            safeAreaBottom={adjustedBottom}
            onViewCart={() => router.push("/(commerce)/cart")}
            hideAddButton
          />
        )}
      </View>

      <LocationBottomSheet
        isVisible={locationSheetVisible}
        onClose={() => setLocationSheetVisible(false)}
      />
    </View>
  );
};
