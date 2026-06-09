import { icons } from "@/src/constants/icons";
import { ANIMATIONS } from "@/src/constants/images";
import { CartEmptyStateProps } from "@/src/types/cart";
import { Touchable } from "@/src/components/ui/Touchable";
import { useNav } from "@/src/hooks/useNav";
import LottieView from "lottie-react-native";
import React from "react";
import { ActivityIndicator, Image, ScrollView, Text, View } from "react-native";

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
        <LottieView
          source={ANIMATIONS.emptyCart}
          autoPlay
          loop
          style={{ width: 140, height: 140 }}
        />
        <Text className="text-[16px] font-inter-semibold text-[#008097] mt-2">
          Your cart is empty
        </Text>
        <Touchable
          activeOpacity={0.85}
          onPress={() => router.replace("/(tabs)")}
          className="bg-brand-primary rounded-[12px] px-8 py-3 mt-4"
        >
          <Text className="text-[14px] font-inter-semibold text-white">
            Add More
          </Text>
        </Touchable>
      </View>

      {featuredProducts.length > 0 && (
        <View className="mt-2">
          <Text className="px-4 mb-2 text-[16px] font-inter-bold text-brand-text">
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
                    height: 305,
                    borderRadius: 16,
                    backgroundColor: '#FFFFFF',
                    shadowColor: '#919EAB',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 6,
                    elevation: 2,
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
                        <Text style={{ fontSize: 10, fontFamily: 'Inter-Bold', color: '#fff' }}>
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
                          fontSize: 13,
                          fontFamily: "Inter-SemiBold",
                          color: "#0F1724",
                          lineHeight: 18,
                        }}
                      >
                        {product.name}
                      </Text>
                      <Text
                        numberOfLines={1}
                        style={{
                          fontSize: 11,
                          fontFamily: "Inter-Bold",
                          color: "#009989",
                          marginTop: 2,
                        }}
                      >
                        {product.brand}
                      </Text>
                      <Text
                        numberOfLines={1}
                        style={{
                          fontSize: 11,
                          fontFamily: "Inter-Regular",
                          color: "#637381",
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
                            fontSize: 15,
                            fontFamily: "Inter-Bold",
                            color: "#0F172A",
                          }}
                        >
                          ₹{Number(product.price).toFixed(2)}
                        </Text>
                        {!!product.originalPrice && (
                          <Text
                            style={{
                              fontSize: 11,
                              fontFamily: "Inter-Regular",
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
                                fontSize: 14,
                                fontFamily: "Inter-Bold",
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
