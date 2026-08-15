import React from "react";
import { View, Text, Pressable, useWindowDimensions } from "react-native";
import { Image } from "expo-image";
import { exactScale } from "@/src/utils/exactScale";
import { cartStyles as s } from "../cart.styles";
import { useNav } from "@/src/hooks/useNav";
import { CartItemsListProps } from "@/src/features/cart/types";
import { CartItemCounter } from "@/src/features/cart/components/CartItemCounter";
import { icons } from "@/src/constants/icons";

export const CartItemsList: React.FC<CartItemsListProps> = React.memo(
  ({ lines, onUpdateItem, onRemoveItem }) => {
    const router = useNav();
    const { width } = useWindowDimensions();
    const compact = width < 360;

    return (
      <View className="mx-4 mt-3 bg-white border border-[#919EAB33] rounded-[12px] px-4 pt-4 pb-2">
        <Text
          style={s.listTitle}
          className="font-inter-bold text-brand-text mb-3"
        >
          Cart Items
        </Text>
        <View
          style={{
            borderTopWidth: 1,
            borderColor: "#E5E7EB",
            marginHorizontal: -16,
          }}
        />
        {lines.map((line, idx) => (
          <View key={line.id}>
            {idx > 0 && (
              <View
                style={{
                  borderTopWidth: 1,
                  borderColor: "#E5E7EB",
                  borderStyle: "dashed",
                }}
              />
            )}
            <View
              className="flex-row py-4"
              style={compact ? { flexWrap: "wrap" } : undefined}
            >
              <Pressable
                className="flex-row flex-1"
                style={compact ? { width: "100%", flexGrow: 0 } : undefined}
                accessibilityRole="link"
                accessibilityLabel={`${line.name}, ${line.pack || "medicine details"}`}
                accessibilityHint="Opens product details"
                onPress={() =>
                  router.push({
                    pathname: "/product/[id]",
                    params: { id: line.productId },
                  })
                }
              >
                <View
                  style={[
                    s.itemImgBox,
                    {
                      backgroundColor: "white",
                      borderWidth: 1,
                      borderColor: "#919EAB33",
                      borderRadius: 10,
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                    },
                  ]}
                >
                  {line.image ? (
                    <Image
                      source={line.image}
                      style={s.itemImg}
                      contentFit="contain"
                      cachePolicy="memory-disk"
                    />
                  ) : (
                    <icons.placeholder
                      width={exactScale(52)}
                      height={exactScale(52)}
                    />
                  )}
                  {line.rx && (
                    <View
                      className="absolute -bottom-1 -right-1"
                      style={{
                        width: exactScale(23),
                        height: exactScale(23),
                        backgroundColor: "#F4FFBA",
                        borderWidth: 1,
                        borderColor: "#919EAB33",
                        borderTopLeftRadius: 4,
                        borderBottomRightRadius: 12,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={s.itemRxText}
                        className="font-inter-semibold text-brand-text leading-none"
                      >
                        Rx
                      </Text>
                    </View>
                  )}
                </View>
                <View className="flex-1 ml-3">
                  <Text
                    numberOfLines={2}
                    style={s.itemTitle}
                    className="font-inter-bold text-brand-text"
                  >
                    {line.name}
                  </Text>
                  <Text
                    style={s.itemSub}
                    className="font-inter-medium text-brand-subtext mt-1"
                  >
                    {[line.brand, line.pack].filter(Boolean).join(" • ")}
                  </Text>
                  {!!line.discount && (
                    <Text
                      style={s.itemDiscount}
                      className="font-inter-bold text-brand-primary mt-1.5"
                    >
                      {line.discount}
                    </Text>
                  )}
                </View>
              </Pressable>
              <View
                className="items-end justify-between ml-2"
                style={
                  compact
                    ? {
                        width: "100%",
                        flexDirection: "row-reverse",
                        alignItems: "center",
                        marginLeft: 0,
                        marginTop: exactScale(16),
                      }
                    : undefined
                }
              >
                <CartItemCounter
                  item={line}
                  updateItem={onUpdateItem}
                  removeItem={onRemoveItem}
                />
                <View
                  className="flex-row items-baseline mt-3"
                  style={compact ? { marginTop: 0 } : undefined}
                  accessible
                  accessibilityLabel={`Price ₹${Number(line.price * line.qty).toFixed(2)}${line.mrp > line.price ? `, MRP ₹${Number(line.mrp * line.qty).toFixed(2)}` : ""}`}
                >
                  {line.mrp > line.price && (
                    <Text
                      style={s.itemMrp}
                      className="font-inter text-brand-subtext line-through mr-1.5"
                    >
                      ₹{Number(line.mrp * line.qty).toFixed(2)}
                    </Text>
                  )}
                  <Text
                    style={s.itemPrice}
                    className="font-inter-bold text-brand-text"
                  >
                    ₹{Number(line.price * line.qty).toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  },
);

CartItemsList.displayName = "CartItemsList";
