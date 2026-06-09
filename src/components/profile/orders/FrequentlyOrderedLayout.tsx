import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { orderStyles as s } from './orders.styles';
import { icons } from "@/src/constants/icons";
import { useCart } from "@/src/hooks/queries/useCart";
import { resolveUUID } from "@/src/utils/resolveUUID";
import { useFrequentlyOrdered } from "@/src/hooks/queries/useOrders";
import { useNav } from "@/src/hooks/useNav";
import { Touchable } from "@/src/components/ui/Touchable";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    Text,
    View,
} from "react-native";

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function ProductCard({ item, index }: { item: any; index: number }) {
  const [qty, setQty] = useState(1);
  const router = useNav();
  const { items: cartItems, addItem, updateItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const productId = item.productId || item.id;

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      const existing = cartItems.find(
        (c) => c.medicineId === productId || c.metadata?.productId === productId,
      );
      if (existing) {
        await updateItem(existing.id, { quantity: existing.quantity + qty });
      } else {
        const itemId = String(item.medicineId ?? item.productId ?? item.id ?? "").trim();
        if (!itemId) {
          throw new Error("[FrequentlyOrdered] missing item id");
        }
        const slug = String(item.slug ?? "").trim() || itemId;
        const name = String(item.name ?? "").trim() || itemId;
        const price =
          Number(item.price ?? item.originalPrice ?? item.mrp ?? 0) ||
          Number(item.originalPrice ?? item.price ?? item.mrp ?? 0) ||
          1;

        const mrp = Number(item.originalPrice ?? item.mrp ?? price);
        const imageUri = item.image?.uri ?? (typeof item.image === 'string' ? item.image : undefined);
        const medicineId = await resolveUUID(itemId, slug, item.productId);
        await addItem({
          medicineId,
          variantId: null,
          medicineName: name,
          medicineSlug: slug,
          unitPrice: Number(price),
          mrp,
          discountPercent: 0,
          quantity: qty || 1,
          requiresPrescription: item.requiresPrescription ?? false,
          image: imageUri,
          metadata: {
            ...(item.productId ? { productId: item.productId } : {}),
            image: imageUri,
            manufacturer: null,
          },
        });
      }
    } catch (err) {
      if (__DEV__) console.log("[FrequentlyOrdered AddToCart] error:", err);
    } finally {
      setIsAdding(false);
    }
  };

  const itemDiscount =
    item.discount ||
    (item.originalPrice && Number(item.originalPrice) > Number(item.price)
      ? `${Math.round(((Number(item.originalPrice) - Number(item.price)) / Number(item.originalPrice)) * 100)}% OFF`
      : undefined);

  return (
    <View
      style={{
        backgroundColor: "#fff",
        borderRadius: 16,
        marginHorizontal: 16,
        marginBottom: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: "#EEEFF1",
      }}
    >
      <Touchable
        activeOpacity={0.7}
        onPress={() =>
          router.push({ pathname: "/product/[id]", params: { id: productId } })
        }
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          marginBottom: 12,
        }}
      >
        <View
          style={{
            width: 100,
            height: 100,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#EEEFF1",
            backgroundColor: "#F9FAFB",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
            position: "relative",
          }}
        >
          {!!itemDiscount && (
            <View
              style={{
                position: "absolute",
                top: 6,
                left: 6,
                backgroundColor: "#E8F5E9",
                paddingHorizontal: 5,
                paddingVertical: 2,
                borderRadius: 4,
                zIndex: 1,
              }}
            >
              <Text
                style={{
                  fontSize: s.labelXs.fontSize,
                  fontFamily: "Inter-ExtraBold",
                  color: "#0F7635",
                }}
              >
                {itemDiscount}
              </Text>
            </View>
          )}
          {typeof item.image === "number" || (item.image && !item.image.uri) ? (
            <Image
              source={item.image}
              style={[s.freqImg, { marginTop: itemDiscount ? 26 : 0 }]}
              resizeMode="contain"
            />
          ) : item.image?.uri ? (
            <Image
              source={{ uri: item.image.uri }}
              style={[s.freqImg, { marginTop: itemDiscount ? 26 : 0 }]}
              resizeMode="contain"
            />
          ) : (
            <icons.placeholder
              width={s.freqImg.width}
              height={s.freqImg.height}
              style={{ marginTop: itemDiscount ? 26 : 0 }}
            />
          )}
        </View>
        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Text
              style={{
                fontSize: s.labelMd.fontSize,
                fontFamily: "Inter-SemiBold",
                color: "#1C2024",
                flex: 1,
                paddingRight: 8,
              }}
              numberOfLines={2}
            >
              {item.name}
            </Text>
            <View style={{ alignItems: "flex-end" }}>
              <Text
                style={{
                  fontSize: s.labelMd.fontSize,
                  fontFamily: "Inter-Bold",
                  color: "#1C2024",
                }}
              >
                ₹{Number(item.price).toFixed(2)}
              </Text>
              {!!item.originalPrice &&
                Number(item.originalPrice) > Number(item.price) && (
                  <Text
                    style={{
                      fontSize: s.statusBadge.fontSize,
                      fontFamily: "Inter-Regular",
                      color: "#919EAB",
                      textDecorationLine: "line-through",
                      marginTop: 2,
                    }}
                  >
                    ₹{Number(item.originalPrice).toFixed(2)}
                  </Text>
                )}
            </View>
          </View>
          {!!item.brand && (
            <Text
              style={{
                fontSize: s.statusBadge.fontSize,
                fontFamily: "Inter-Medium",
                color: "#637381",
                marginTop: 3,
                marginBottom: 1,
              }}
              numberOfLines={1}
            >
              {item.brand}
            </Text>
          )}
          {!!(item.description || item.form) && (
            <Text
              style={{
                fontSize: s.statusBadge.fontSize,
                fontFamily: "Inter-Regular",
                color: "#919EAB",
                marginTop: 2,
                marginBottom: 2,
              }}
              numberOfLines={1}
            >
              {item.description || item.form}
            </Text>
          )}
        </View>
      </Touchable>

      {/* Horizontal Dashed Line Divider */}
      <View
        style={{
          borderStyle: "dashed",
          borderWidth: 1,
          borderColor: "#EEEFF1",
          height: 0,
          marginVertical: 12,
        }}
      />

      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 0.69,
            borderColor: "#919EAB33",
            borderRadius: 8,
          }}
        >
          <Touchable
            onPress={() => setQty((q) => Math.max(1, q - 1))}
            style={{
              width: s.productImg36.width,
              height: s.productImg36.height,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontSize: s.label20.fontSize,
                fontFamily: "Inter-Medium",
                color: "#1C2024",
              }}
            >
              −
            </Text>
          </Touchable>
          <Text
            style={{
              fontSize: s.labelMd.fontSize,
              fontFamily: "Inter-SemiBold",
              color: "#1C2024",
              paddingHorizontal: 8,
            }}
          >
            {qty}
          </Text>
          <Touchable
            onPress={() => setQty((q) => q + 1)}
            style={{
              width: s.productImg36.width,
              height: s.productImg36.height,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontSize: s.label20.fontSize,
                fontFamily: "Inter-Medium",
                color: "#1C2024",
              }}
            >
              +
            </Text>
          </Touchable>
        </View>
        <Touchable
          style={{
            flex: 1,
            height: 40,
            borderRadius: 8,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: "#0F763533",
            backgroundColor: "#F1F9F4",
          }}
          activeOpacity={0.6}
          onPress={handleAddToCart}
          disabled={isAdding}
        >
          {isAdding ? (
            <ActivityIndicator size="small" color="#0F7635" />
          ) : (
            <Text
              style={{
                fontSize: s.labelSm.fontSize,
                fontFamily: "Inter-SemiBold",
                color: "#0F7635",
              }}
            >
              Add to cart
            </Text>
          )}
        </Touchable>
      </View>

      {(!!item.orderedTimes || !!item.lastOrdered) && (
        <View
          style={{ flexDirection: "row", alignItems: "center", marginTop: 12 }}
        >
          <icons.trend_up
            width={14}
            height={14}
            fill="#0F7635"
            style={{ marginRight: 6 }}
          />
          {!!item.orderedTimes && (
            <Text
              style={{
                fontSize: s.labelSm.fontSize,
                fontFamily: "Inter-SemiBold",
                color: "#0F7635",
              }}
            >
              Ordered {String(item.orderedTimes).padStart(2, "0")} times
            </Text>
          )}
          {!!item.lastOrdered && (
            <Text
              style={{
                fontSize: s.labelSm.fontSize,
                fontFamily: "Inter-Medium",
                color: "#637381",
                marginLeft: item.orderedTimes ? 8 : 0,
              }}
            >
              Last ordered: {formatDate(item.lastOrdered)}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

export const FrequentlyOrderedLayout: React.FC = () => {
  const router = useNav();
  const { totalItems } = useCart();
  const { data: frequentlyOrdered = [], isLoading } = useFrequentlyOrdered();

  const displayProducts = frequentlyOrdered;

  return (
    <View className="flex-1 bg-[#F5F6FB]">
      <ScreenHeader
        title="Frequently Ordered List"
        backgroundColor="#FFFFFF"
        rightSlot={
          <View className="relative">
            <Touchable
              className="bg-white rounded-full border border-[#919EAB33] items-center justify-center"
              style={s.freqCounterBtn}
              onPress={() => router.push("/(modal)/cart")}
            >
              <icons.cart_svg width={s.icon24.width} height={s.icon24.height} fill="#222222" />
            </Touchable>
            {totalItems > 0 && (
              <View className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#C22923] items-center justify-center">
                <Text style={s.labelXs} className="font-inter-bold text-white">
                  {totalItems}
                </Text>
              </View>
            )}
          </View>
        }
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          displayProducts.length === 0
            ? {
                flexGrow: 1,
                justifyContent: "center",
                paddingHorizontal: 32,
                paddingBottom: 80,
              }
            : { paddingTop: 12, paddingBottom: 24 }
        }
      >
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#0F7635" />
          </View>
        ) : displayProducts.length === 0 ? (
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <Text
              style={{
                fontSize: s.labelXl.fontSize,
                fontFamily: "Inter-SemiBold",
                color: "#637381",
                textAlign: "center",
              }}
            >
              No frequently ordered products yet
            </Text>
            <Text
              style={{
                fontSize: s.labelSm.fontSize,
                fontFamily: "Inter-Regular",
                color: "#919EAB",
                marginTop: 6,
                textAlign: "center",
              }}
            >
              Your frequently ordered products will appear here
            </Text>
          </View>
        ) : (
          displayProducts.map((item, index) => (
            <ProductCard
              key={`${item.productId ?? item.id}-${index}`}
              item={item}
              index={index}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};
