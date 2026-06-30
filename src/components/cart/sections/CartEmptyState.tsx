import { icons } from "@/src/constants/icons";
import { ANIMATIONS } from "@/src/constants/images";
import { CartEmptyStateProps } from "@/src/types/cart";
import { Touchable } from "@/src/components/ui/Touchable";
import { useNav } from "@/src/hooks/useNav";
import { DotLottie } from "@lottiefiles/dotlottie-react-native";
import React from "react";
import { ActivityIndicator, Image, ScrollView, Text, View } from "react-native";
import { moderateScale } from "@/src/utils/exactScale";

export const CartEmptyState: React.FC<CartEmptyStateProps> = ({
  featuredProducts,
  onAddItem,
}) => {
  const router = useNav();
  const [addingProductId, setAddingProductId] = React.useState<string | null>(null);

  const handleAdd = async (product: any) => {
    setAddingProductId(product.id);
    try {
      const apiPromise = Promise.resolve(onAddItem(product));
      const delayPromise = new Promise((resolve) => setTimeout(resolve, 3000));
      await Promise.all([apiPromise, delayPromise]);
    } catch (error) {
      console.error("Error adding item to cart:", error);
    } finally {
      setAddingProductId(null);
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View className="items-center justify-center px-8 py-6">
        <DotLottie
          source={ANIMATIONS.emptyCart}
          autoplay
          loop
          style={{ width: 140, height: 140 }}
        />
        <Text className="font-inter-semibold text-[#008097] mt-2" style={{ fontSize: moderateScale(16) }}>
          Your cart is empty
        </Text>
        <Touchable
          activeOpacity={0.85}
          onPress={() => router.replace("/(tabs)")}
          className="bg-brand-primary rounded-[12px] px-8 py-3 mt-4"
        >
          <Text className="font-inter-semibold text-white" style={{ fontSize: moderateScale(14) }}>
            Add More
          </Text>
        </Touchable>
      </View>

      {featuredProducts.length > 0 && (
        <View className="mt-2">
          <Text className="px-4 mb-2 font-inter-bold text-brand-text" style={{ fontSize: moderateScale(16) }}>
            Before you go
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingTop: 4,
              paddingBottom: 16,
            }}
          >
            {featuredProducts.slice(0, 5).map((product) => (
              <Touchable
                key={product.id}
                activeOpacity={0.85}
                onPress={() =>
                  router.push({
                    pathname: "/product/[id]",
                    params: { id: product.productId ?? product.id },
                  } as any)
                }
                style={{ width: 165, marginRight: 12 }}
              >
                {/* Unified Premium Card Wrapper */}
                <View
                  style={{
                    height: 300,
                    borderRadius: 12,
                    backgroundColor: '#FFFFFF',
                    overflow: 'hidden',
                  }}
                >
                  {/* Image wrapper */}
                  <View style={{ height: 115, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    {product.image?.uri ? (
                      <Image source={product.image as any} style={{ width: '70%', height: '70%' }} resizeMode="contain" />
                    ) : (
                      <icons.placeholder width="55%" height="55%" />
                    )}

                    {/* Discount badge */}
                    {!!product.discount && (
                      <View style={{ position: 'absolute', top: 8, left: 8, zIndex: 10, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, backgroundColor: '#008097' }}>
                        <Text style={{ fontSize: moderateScale(10), fontWeight: '700', color: '#fff' }}>
                          {String(product.discount).toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Content section */}
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: "#F5F6FB",
                      padding: 10,
                      justifyContent: "space-between",
                    }}
                  >
                    {/* Top Text block */}
                    <View>
                      <Text
                        numberOfLines={2}
                        style={{
                          fontSize: moderateScale(13.5),
                          fontWeight: "500",
                          color: "#222222",
                          lineHeight: moderateScale(18),
                        }}
                      >
                        {product.name}
                      </Text>
                      <Text
                        numberOfLines={1}
                        style={{
                          fontSize: moderateScale(12),
                          fontWeight: "700",
                          color: "#009989",
                          marginTop: 2,
                        }}
                      >
                        {product.brand}
                      </Text>
                      <Text
                        numberOfLines={1}
                        style={{
                          fontSize: moderateScale(11),
                          fontWeight: "500",
                          color: "#6A6A6A",
                          marginTop: 1,
                        }}
                      >
                        {product.pack || " "}
                      </Text>
                    </View>

                    {/* Bottom Action & Price block */}
                    <View>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "baseline",
                          marginBottom: 4,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: moderateScale(15),
                            fontWeight: "700",
                            color: "#0F172A",
                          }}
                        >
                          ₹{Number(product.price).toFixed(2)}
                        </Text>
                        {!!product.originalPrice && product.originalPrice > product.price && (
                          <Text
                            style={{
                              fontSize: moderateScale(11),
                              fontWeight: "400",
                              color: "#637381",
                              textDecorationLine: "line-through",
                              marginLeft: 6,
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
                            backgroundColor: "#fff",
                            borderWidth: 1,
                            borderColor: "#0F7635",
                            borderRadius: 10,
                            paddingVertical: 9,
                            alignItems: "center",
                            justifyContent: "center",
                            marginVertical: 4,
                            opacity: addingProductId !== null ? 0.7 : 1,
                          }}
                        >
                          {addingProductId === product.id ? (
                            <View style={{ height: 17, justifyContent: "center", alignItems: "center" }}>
                              <ActivityIndicator size="small" color="#0F7635" />
                            </View>
                          ) : (
                            <Text
                              style={{
                                fontSize: moderateScale(14),
                                fontWeight: "700",
                                color: "#0F7635",
                              }}
                            >
                              Add
                            </Text>
                          )}
                        </Touchable>
                      </View>
                    </View>

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
