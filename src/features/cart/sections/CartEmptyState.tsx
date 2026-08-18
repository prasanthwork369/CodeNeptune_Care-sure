import { Touchable } from "@/src/components/ui/Touchable";
import { OfferShine } from "@/src/components/ui/offerShine";
import { icons } from "@/src/constants/icons";
import { ANIMATIONS } from "@/src/constants/images";
import { useNav } from "@/src/hooks/useNav";
import { CartEmptyStateProps } from "@/src/features/cart/types";
import { Product } from "@/src/features/product/types";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { DotLottie } from "@lottiefiles/dotlottie-react-native";
import { Image } from "expo-image";
import React from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

export const CartEmptyState: React.FC<CartEmptyStateProps> = ({
  featuredProducts,
  onAddItem,
}) => {
  const router = useNav();
  const [addingProductId, setAddingProductId] = React.useState<string | null>(
    null,
  );

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
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: exactScale(28) }}
    >
      <View
        className="items-center justify-center px-8"
        style={{
          paddingTop: exactScale(24),
          paddingBottom: exactScale(58),
        }}
      >
        <DotLottie
          source={ANIMATIONS.emptyCart}
          autoplay
          loop
          style={{ width: exactScale(140), height: exactScale(140) }}
        />
        <Text
          className="font-inter-bold text-[#111111]"
          style={{
            fontSize: moderateScale(17),
            lineHeight: moderateScale(22),
            marginTop: exactScale(8),
          }}
        >
          Your cart is empty
        </Text>
        <Touchable
          activeOpacity={0.85}
          onPress={() => router.replace("/(tabs)")}
          className="bg-brand-primary items-center justify-center"
          style={{
            width: exactScale(152),
            height: exactScale(50),
            borderRadius: exactScale(12),
            marginTop: exactScale(20),
          }}
        >
          <Text
            className="font-inter-semibold text-white"
            style={{
              fontSize: moderateScale(16),
              lineHeight: moderateScale(20),
            }}
          >
            Add Medicines
          </Text>
        </Touchable>
      </View>

      {featuredProducts.length > 0 && (
        <View>
          <Text
            className="px-4 font-inter-bold text-brand-text"
            style={{
              fontSize: moderateScale(16),
              lineHeight: moderateScale(21),
              marginBottom: exactScale(10),
            }}
          >
            Before you go
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: exactScale(16),
              paddingTop: exactScale(0),
              paddingBottom: exactScale(16),
            }}
          >
            {featuredProducts.slice(0, 5).map((product) => (
              <Touchable
                key={product.id}
                activeOpacity={0.85}
                // productId only — no fallback to product.id. That is the
                // medicine id, and /search/products/{id} resolves product ids
                // only, so the old `?? product.id` navigated to a dead screen.
                // Every other screen passes productId alone.
                onPress={() => {
                  if (!product.productId) return;
                  router.push({
                    pathname: "/product/[id]",
                    params: { id: product.productId },
                  });
                }}
                style={{ width: exactScale(167), marginRight: exactScale(10) }}
              >
                {/* Product image card */}
                <View
                  style={{
                    height: exactScale(163),
                    borderRadius: exactScale(13),
                    borderWidth: 1,
                    borderColor: "#DDE1E8",
                    backgroundColor: "#FFFFFF",
                    overflow: "hidden",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  {product.image?.uri ? (
                    <Image
                      source={{ uri: product.image.uri }}
                      style={{ width: "82%", height: "82%" }}
                      contentFit="contain"
                    />
                  ) : (
                    <icons.placeholder width="58%" height="58%" />
                  )}

                  {!!product.discount && (
                    <View
                      style={{
                        position: "absolute",
                        top: exactScale(12),
                        left: exactScale(11),
                        zIndex: 10,
                        borderRadius: exactScale(4),
                        paddingHorizontal: exactScale(8),
                        paddingVertical: exactScale(5),
                        backgroundColor: "#008FA3",
                        overflow: "hidden",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: moderateScale(13),
                          lineHeight: moderateScale(16),
                          fontWeight: "700",
                          color: "#FFFFFF",
                        }}
                      >
                        {String(product.discount).toUpperCase()}
                      </Text>
                      <OfferShine borderRadius={exactScale(4)} />
                    </View>
                  )}
                </View>

                {/* Product information */}
                <View style={{ marginTop: exactScale(14) }}>
                  <Text
                    numberOfLines={2}
                    style={{
                      minHeight: moderateScale(42),
                      fontSize: moderateScale(15),
                      fontWeight: "500",
                      color: "#252525",
                      lineHeight: moderateScale(21),
                    }}
                  >
                    {product.name}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={{
                      fontSize: moderateScale(13),
                      lineHeight: moderateScale(18),
                      fontWeight: "700",
                      color: "#009B8D",
                      marginTop: exactScale(6),
                    }}
                  >
                    {product.brand}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={{
                      fontSize: moderateScale(12),
                      lineHeight: moderateScale(17),
                      fontWeight: "500",
                      color: "#6A6A6A",
                      marginTop: exactScale(2),
                    }}
                  >
                    {product.pack || " "}
                  </Text>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "baseline",
                      minHeight: moderateScale(23),
                      marginTop: exactScale(8),
                    }}
                  >
                    <Text
                      style={{
                        fontSize: moderateScale(17),
                        lineHeight: moderateScale(22),
                        fontWeight: "700",
                        color: "#111827",
                      }}
                    >
                      ₹{Number(product.price).toFixed(2)}
                    </Text>
                    {!!product.originalPrice &&
                      product.originalPrice > product.price && (
                        <Text
                          style={{
                            fontSize: moderateScale(13),
                            lineHeight: moderateScale(18),
                            fontWeight: "400",
                            color: "#777777",
                            textDecorationLine: "line-through",
                            marginLeft: exactScale(7),
                          }}
                        >
                          ₹{Number(product.originalPrice).toFixed(2)}
                        </Text>
                      )}
                  </View>

                  <View onStartShouldSetResponder={() => true}>
                    <Touchable
                      activeOpacity={0.85}
                      disabled={addingProductId !== null}
                      onPress={() => handleAdd(product)}
                      style={{
                        height: exactScale(39),
                        backgroundColor: "transparent",
                        borderWidth: 1,
                        borderColor: "#0F7635",
                        borderRadius: exactScale(12),
                        alignItems: "center",
                        justifyContent: "center",
                        marginTop: exactScale(10),
                        opacity: addingProductId !== null ? 0.7 : 1,
                      }}
                    >
                      {addingProductId === product.id ? (
                        <ActivityIndicator size="small" color="#0F7635" />
                      ) : (
                        <Text
                          style={{
                            fontSize: moderateScale(14),
                            lineHeight: moderateScale(18),
                            fontWeight: "700",
                            color: "#0F7635",
                          }}
                        >
                          ADD
                        </Text>
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
