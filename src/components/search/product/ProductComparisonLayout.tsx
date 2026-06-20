import {
    LocationBottomSheet,
    WhyFamiliesTrustUs,
} from "@/src/components/home/sections";
import {
    KnowYourMedicine,
    LogisticsBar,
    ProductDetailsFooter,
    SaltCompositionBanner,
    TrustBadge,
} from "@/src/components/product/details/sections";
import { ProductHeader } from "@/src/components/search/product/ProductHeader";
import { useProductHeroAnimation } from "@/src/hooks/animations/useProductHeroAnimation";
import { useCart } from "@/src/hooks/queries/useCart";
import { useHome } from "@/src/hooks/queries/useHome";
import { useProduct } from "@/src/hooks/queries/useProduct";
import { useNav } from "@/src/hooks/useNav";
import { useLocationStore } from "@/src/store/locationStore";
import { RecommendedProduct, SearchedProduct } from "@/src/types/search";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
    ComparisonBoard,
    MoreAboutSection,
    ProductDetailsSkeleton,
} from "./sections";

interface ProductComparisonLayoutProps {
  id: string;
}

export const ProductComparisonLayout: React.FC<
  ProductComparisonLayoutProps
> = ({ id }) => {
  const router = useNav();
  const insets = useSafeAreaInsets();
  const [locationSheetVisible, setLocationSheetVisible] = useState(false);

  const goBack = useCallback(() => router.back(), [router]);
  const {
    containerStyle,
    contentStyle,
    backdropStyle,
    screenStyle,
    handleBack,
  } = useProductHeroAnimation(goBack);

  const { product, recommendation, saltComposition, raw, isLoading } =
    useProduct(id);
  const { appContent, isLoading: isHomeLoading } = useHome();
  const { items: cartItems, totalItems: cartCount } = useCart();
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

  const recPackSize = raw?.recommendation?.packSize
    ? parseInt(String(raw.recommendation.packSize).match(/\d+/)?.[0] ?? "1")
    : 1;
  const recUnitPrice = recommendation
    ? (recommendation.price / Math.max(recPackSize, 1)).toFixed(2)
    : undefined;

  return (
    <Animated.View
      style={[{ flex: 1, backgroundColor: "#FFFFFF" }, screenStyle]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: "rgba(0,0,0,0.15)" },
          backdropStyle,
        ]}
        pointerEvents="none"
      />

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
                height: 180,
              }}
            />

            <ProductHeader
              query={raw?.name ?? ""}
              cartCount={cartCount}
              isSearching={true}
              onBack={handleBack}
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
                    fontSize: 16,
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
                contentContainerStyle={{
                  paddingBottom: isRecommendedInCart
                    ? insets.bottom + 100
                    : insets.bottom + 24,
                }}
                style={{ flex: 1 }}
                bounces={false}
                overScrollMode="never"
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

                <KnowYourMedicine manufacturer={manufacturer} />
                <View style={{ backgroundColor: "#FFFFFF" }}>
                  <WhyFamiliesTrustUs
                    promise={appContent?.promise}
                    isLoading={isHomeLoading}
                    showTitle={false}
                  />
                </View>

                <MoreAboutSection
                  medicineName={medicineName}
                  mobileAdditionalData={raw?.mobileAdditionalData}
                />
              </ScrollView>
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
                safeAreaBottom={insets.bottom}
                onViewCart={() => router.push("/(modal)/cart")}
                hideAddButton
              />
            )}
          </View>
        </Animated.View>
      </Animated.View>

      <LocationBottomSheet
        isVisible={locationSheetVisible}
        onClose={() => setLocationSheetVisible(false)}
      />
    </Animated.View>
  );
};
