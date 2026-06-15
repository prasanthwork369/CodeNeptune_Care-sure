import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { CART_BUTTON_HEIGHT } from "@/src/constants/theme";
import { useNav } from "@/src/hooks/useNav";
import { useCart } from "@/src/hooks/queries/useCart";
import { resolveUUID } from "@/src/utils/resolveUUID";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
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

export function ProductCard({ item, index }: { item: any; index: number }) {
  const router = useNav();
  const { items: cartItems, addItem, updateItem, removeItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const productId = item.productId || item.id;
  const qty = item.lastQty ?? item.qty ?? 1;
  const cartItem = cartItems.find(
    (c: any) => c.medicineId === productId || c.metadata?.productId === productId
                || c.medicineId === item.id || c.medicineId === item.medicineId,
  );
  const [counterPending, setCounterPending] = useState(false);

  const handleCounterChange = async (newQty: number) => {
    if (!cartItem || counterPending) return;
    setCounterPending(true);
    try {
      if (newQty <= 0) await removeItem(cartItem.id);
      else await updateItem(cartItem.id, { quantity: newQty });
    } finally {
      setCounterPending(false);
    }
  };

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      const existing = cartItems.find(
        (c: any) => c.medicineId === productId || c.metadata?.productId === productId,
      );
      if (existing) {
        await updateItem(existing.id, { quantity: existing.quantity + qty });
      } else {
        const itemId = String(item.medicineId ?? item.productId ?? item.id ?? "").trim();
        if (!itemId) {
          throw new Error("[FrequentOrders] missing item id");
        }
        const slug =
          String(item.slug ?? item.productId ?? item.id ?? "").trim() || itemId;
        const name =
          String(item.name ?? item.productId ?? item.id ?? "").trim() || itemId;
        const price =
          Number(item.price ?? item.originalPrice ?? item.mrp ?? 0) ||
          Number(item.originalPrice ?? item.price ?? item.mrp ?? 0) ||
          1;

        const mrp = Number(item.originalPrice ?? item.mrp ?? price);
        const imageUri = item.image?.uri ?? (typeof item.image === 'string' ? item.image : undefined);
        const medicineId = await resolveUUID(itemId, slug, item.productId);
        if (__DEV__) console.log('[FrequentOrders] resolved:', { itemId, slug, medicineId });
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
    } catch (err: any) {
      if (__DEV__) console.error("[FrequentOrders AddToCart] error:", err?.message ?? err);
      Alert.alert('Failed', err?.message ?? 'Could not add to cart. Please try again.');
    } finally {
      setIsAdding(false);
    }
  };

  const brandLine = [item.brand, item.description || item.form]
    .filter(Boolean)
    .join(" • ");

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
      {/* Top row: image + info */}
      <Touchable
        activeOpacity={0.7}
        onPress={() =>
          router.push({ pathname: "/product/[id]", params: { id: productId } })
        }
        style={{ flexDirection: "row", alignItems: "flex-start" }}
      >
        {/* Product image */}
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#EEEFF1",
            backgroundColor: "#F9FAFB",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          {typeof item.image === "number" || (item.image && !item.image.uri) ? (
            <Image
              source={item.image}
              style={{ width: 54, height: 54 }}
              resizeMode="contain"
            />
          ) : item.image?.uri ? (
            <Image
              source={{ uri: item.image.uri }}
              style={{ width: 54, height: 54 }}
              resizeMode="contain"
            />
          ) : (
            <icons.placeholder width={54} height={54} />
          )}
        </View>

        {/* Name, price, brand, qty badge */}
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
                fontSize: 14,
                fontFamily: "Inter-SemiBold",
                color: "#1C2024",
                flex: 1,
                paddingRight: 8,
              }}
              numberOfLines={2}
            >
              {item.name}
            </Text>
            {/* Price */}
            <View style={{ alignItems: "flex-end" }}>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter-Bold",
                  color: "#0F7635",
                }}
              >
                ₹{Number(item.price).toFixed(1)}
              </Text>
              {!!item.originalPrice &&
                Number(item.originalPrice) > Number(item.price) && (
                  <Text
                    style={{
                      fontSize: 11,
                      fontFamily: "Inter-Regular",
                      color: "#919EAB",
                      textDecorationLine: "line-through",
                      marginTop: 2,
                    }}
                  >
                    ₹{Number(item.originalPrice).toFixed(1)}
                  </Text>
                )}
            </View>
          </View>

          {/* Brand • Pack info */}
          {!!brandLine && (
            <Text
              style={{
                fontSize: 11,
                fontFamily: "Inter-Regular",
                color: "#637381",
                marginTop: 4,
                marginBottom: 8,
              }}
              numberOfLines={1}
            >
              {brandLine}
            </Text>
          )}

          {/* Qty badge */}
          <View
            style={{
              alignSelf: "flex-start",
              borderWidth: 1,
              borderColor: "#EEEFF1",
              borderRadius: 6,
              paddingHorizontal: 10,
              paddingVertical: 3,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontFamily: "Inter-Medium",
                color: "#1C2024",
              }}
            >
              Qty: {qty}
            </Text>
          </View>
        </View>
      </Touchable>

      {/* Dashed divider */}
      <View
        style={{
          borderStyle: "dashed",
          borderWidth: 1,
          borderColor: "#EEEFF1",
          height: 0,
          marginVertical: 12,
        }}
      />

      {/* Add to cart — full width */}
      {cartItem ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', borderRadius: 10, overflow: 'hidden', backgroundColor: '#0F7635', height: CART_BUTTON_HEIGHT }}>
          <Touchable onPress={() => handleCounterChange(cartItem.quantity - 1)} disabled={counterPending} activeOpacity={0.7} style={{ width: 44, height: '100%', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 20, color: '#fff', fontFamily: 'Inter-Medium', lineHeight: 24 }}>−</Text>
          </Touchable>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            {counterPending
              ? <ActivityIndicator size="small" color="#fff" />
              : <Text style={{ fontSize: 14, fontFamily: 'Inter-Bold', color: '#fff' }}>{cartItem.quantity}</Text>
            }
          </View>
          <Touchable onPress={() => handleCounterChange(cartItem.quantity + 1)} disabled={counterPending} activeOpacity={0.7} style={{ width: 44, height: '100%', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 20, color: '#fff', fontFamily: 'Inter-Medium', lineHeight: 24 }}>+</Text>
          </Touchable>
        </View>
      ) : (
        <Touchable
          style={{ height: CART_BUTTON_HEIGHT, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#0F763533', backgroundColor: '#fff' }}
          activeOpacity={0.6}
          onPress={handleAddToCart}
          disabled={isAdding}
        >
          {isAdding
            ? <ActivityIndicator size="small" color="#0F7635" />
            : <Text style={{ fontSize: 14, fontFamily: 'Inter-SemiBold', color: '#0F7635' }}>Add to cart</Text>
          }
        </Touchable>
      )}

      {/* Ordered X times + last ordered */}
      {(!!item.orderedTimes || !!item.lastOrdered) && (
        <View
          style={{ flexDirection: "row", alignItems: "center", marginTop: 10 }}
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
                fontSize: 12,
                fontFamily: "Inter-SemiBold",
                color: "#0F7635",
              }}
            >
              Ordered {item.orderedTimes} times
            </Text>
          )}
          {!!item.lastOrdered && (
            <Text
              style={{
                fontSize: 12,
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
