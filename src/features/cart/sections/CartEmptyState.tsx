import { OfferShine } from "@/src/components/ui/offerShine";
import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { ANIMATIONS } from "@/src/constants/images";
import type { CartEmptyStateProps } from "@/src/features/cart/types";
import type { Product } from "@/src/features/product/types";
import { useNav } from "@/src/hooks/useNav";
import { exactScale } from "@/src/utils/exactScale";
import { DotLottie } from "@lottiefiles/dotlottie-react-native";
import { Image } from "expo-image";
import React, { useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { styles as s } from "./CartEmptyState.styles";

export const CartEmptyState: React.FC<CartEmptyStateProps> = ({
  featuredProducts,
  onAddItem,
}) => {
  const router = useNav();
  const [addingProductId, setAddingProductId] = useState<string | null>(null);

  const handleAdd = async (product: Product) => {
    setAddingProductId(product.id);
    try {
      const apiPromise = Promise.resolve(onAddItem(product));
      const delayPromise = new Promise((resolve) => setTimeout(resolve, 3000));
      await Promise.all([apiPromise, delayPromise]);
    } catch (error) {
      if (__DEV__) console.error("Error adding item to cart:", error);
    } finally {
      setAddingProductId(null);
    }
  };

  return (
    <ScrollView
      style={s.scroll}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={s.scrollContent}
    >
      <View style={s.emptyHero}>
        <DotLottie
          source={ANIMATIONS.emptyCart}
          autoplay
          loop
          style={s.emptyLottie}
        />
        <Text style={s.emptyTitle}>Your cart is empty</Text>
        <Touchable
          activeOpacity={0.85}
          onPress={() => router.push("/search")}
          style={s.browseBtn}
        >
          <Text style={s.browseBtnText}>Add Medicines</Text>
        </Touchable>
      </View>

      {featuredProducts.length > 0 && (
        <View>
          <Text style={s.sectionTitle}>Before you go</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.horizontalScrollContent}
          >
            {featuredProducts.slice(0, 5).map((product) => (
              <Touchable
                key={product.id}
                activeOpacity={0.85}
                onPress={() => {
                  if (!product.productId) return;
                  router.push({
                    pathname: "/product/[id]",
                    params: { id: product.productId },
                  });
                }}
                style={s.productCard}
              >
                {/* Product image card */}
                <View style={s.imageCard}>
                  {product.image?.uri ? (
                    <Image
                      source={{ uri: product.image.uri }}
                      style={s.productImg}
                      contentFit="contain"
                    />
                  ) : (
                    <icons.placeholder width="58%" height="58%" />
                  )}

                  {!!product.discount && (
                    <View style={s.discountBadge}>
                      <Text style={s.discountText}>
                        {String(product.discount).toUpperCase()}
                      </Text>
                      <OfferShine borderRadius={exactScale(4)} />
                    </View>
                  )}
                </View>

                {/* Product information */}
                <View style={s.infoContainer}>
                  <Text numberOfLines={2} style={s.productName}>
                    {product.name}
                  </Text>
                  <Text numberOfLines={1} style={s.productBrand}>
                    {product.brand}
                  </Text>
                  <Text numberOfLines={1} style={s.productPack}>
                    {product.pack || " "}
                  </Text>

                  <View style={s.priceRow}>
                    <Text style={s.priceText}>
                      ₹{Number(product.price).toFixed(2)}
                    </Text>
                    {!!product.originalPrice &&
                      product.originalPrice > product.price && (
                        <Text style={s.originalPriceText}>
                          ₹{Number(product.originalPrice).toFixed(2)}
                        </Text>
                      )}
                  </View>

                  <View onStartShouldSetResponder={() => true}>
                    <Touchable
                      activeOpacity={0.85}
                      disabled={addingProductId !== null}
                      onPress={() => handleAdd(product)}
                      style={[
                        s.addBtn,
                        { opacity: addingProductId !== null ? 0.7 : 1 },
                      ]}
                    >
                      {addingProductId === product.id ? (
                        <ActivityIndicator size="small" color="#0F7635" />
                      ) : (
                        <Text style={s.addBtnText}>ADD</Text>
                      )}
                    </Touchable>
                  </View>
                </View>
              </Touchable>
            ))}
          </ScrollView>
        </View>
      )}
    </ScrollView>
  );
};
