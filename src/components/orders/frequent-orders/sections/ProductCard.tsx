import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { CART_BUTTON_HEIGHT } from "@/src/constants/theme";
import { useNav } from "@/src/hooks/useNav";
import { useCart } from "@/src/hooks/queries/useCart";
import { resolveUUID } from "@/src/utils/resolveUUID";
import React, { useState } from "react";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
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

// "cartCounter" (default): read-only history qty, switches to an in-cart +/- pill once added.
// "preAddStepper": editable qty stepper before adding, always shows the Add to cart button.
type ProductCardVariant = "cartCounter" | "preAddStepper";

export function ProductCard({
  item,
  index,
  variant = "cartCounter",
}: {
  item: any;
  index: number;
  variant?: ProductCardVariant;
}) {
  const isStepperVariant = variant === "preAddStepper";
  const router = useNav();
  const { items: cartItems, addItem, updateItem, removeItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [manualQty, setManualQty] = useState(1);

  const productId = item.productId || item.id;
  const historyQty = item.lastQty ?? item.qty ?? 1;
  const qty = isStepperVariant ? manualQty : historyQty;
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
          throw new Error(
            isStepperVariant
              ? "[FrequentlyOrdered] missing item id"
              : "[FrequentOrders] missing item id",
          );
        }
        const slug = isStepperVariant
          ? String(item.slug ?? "").trim() || itemId
          : String(item.slug ?? item.productId ?? item.id ?? "").trim() || itemId;
        const name = isStepperVariant
          ? String(item.name ?? "").trim() || itemId
          : String(item.name ?? item.productId ?? item.id ?? "").trim() || itemId;
        const price =
          Number(item.price ?? item.originalPrice ?? item.mrp ?? 0) ||
          Number(item.originalPrice ?? item.price ?? item.mrp ?? 0) ||
          1;

        const mrp = Number(item.originalPrice ?? item.mrp ?? price);
        const imageUri = item.image?.uri ?? (typeof item.image === 'string' ? item.image : undefined);
        const medicineId = await resolveUUID(itemId, slug, item.productId);
        if (!isStepperVariant && __DEV__) console.log('[FrequentOrders] resolved:', { itemId, slug, medicineId });
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
      if (isStepperVariant) {
        if (__DEV__) console.log("[FrequentlyOrdered AddToCart] error:", err);
      } else {
        if (__DEV__) console.error("[FrequentOrders AddToCart] error:", err?.message ?? err);
        Alert.alert('Failed', err?.message ?? 'Could not add to cart. Please try again.');
      }
    } finally {
      setIsAdding(false);
    }
  };

  const brandLine = [item.brand, item.description || item.form]
    .filter(Boolean)
    .join(" • ");

  const itemDiscount =
    item.discount ||
    (item.originalPrice && Number(item.originalPrice) > Number(item.price)
      ? `${Math.round(((Number(item.originalPrice) - Number(item.price)) / Number(item.originalPrice)) * 100)}% OFF`
      : undefined);

  const labelMdFontSize = isStepperVariant ? moderateScale(14, 0.1) : moderateScale(14);
  const smallFontSize = isStepperVariant ? moderateScale(11, 0.08) : moderateScale(11);
  const orderedFontSize = isStepperVariant ? moderateScale(13, 0.1) : moderateScale(12);
  const imgSize = isStepperVariant ? exactScale(54) : 54;

  return (
    <View
      style={{
        backgroundColor: "#fff",
        borderRadius: 16,
        marginHorizontal: isStepperVariant ? 16 : exactScale(16),
        marginBottom: isStepperVariant ? 12 : exactScale(12),
        padding: isStepperVariant ? 16 : exactScale(16),
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
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          marginBottom: isStepperVariant ? 12 : undefined,
        }}
      >
        {/* Product image */}
        <View
          style={{
            width: isStepperVariant ? 100 : 80,
            height: isStepperVariant ? 100 : 80,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#EEEFF1",
            backgroundColor: "#F9FAFB",
            alignItems: "center",
            justifyContent: "center",
            marginRight: isStepperVariant ? 12 : exactScale(12),
            position: isStepperVariant ? "relative" : undefined,
          }}
        >
          {isStepperVariant && !!itemDiscount && (
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
                  fontSize: moderateScale(10, 0.08),
                  fontWeight: "800",
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
              style={{ width: imgSize, height: imgSize, marginTop: isStepperVariant && itemDiscount ? 26 : 0 }}
              resizeMode="contain"
            />
          ) : item.image?.uri ? (
            <Image
              source={{ uri: item.image.uri }}
              style={{ width: imgSize, height: imgSize, marginTop: isStepperVariant && itemDiscount ? 26 : 0 }}
              resizeMode="contain"
            />
          ) : (
            <icons.placeholder
              width={imgSize}
              height={imgSize}
              style={{ marginTop: isStepperVariant && itemDiscount ? 26 : 0 }}
            />
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
                fontSize: labelMdFontSize,
                fontWeight: "600",
                color: "#1C2024",
                flex: 1,
                paddingRight: isStepperVariant ? 8 : exactScale(8),
              }}
              numberOfLines={2}
            >
              {item.name}
            </Text>
            {/* Price */}
            <View style={{ alignItems: "flex-end" }}>
              <Text
                style={{
                  fontSize: labelMdFontSize,
                  fontWeight: "700",
                  color: isStepperVariant ? "#1C2024" : "#0F7635",
                }}
              >
                ₹{Number(item.price).toFixed(isStepperVariant ? 2 : 1)}
              </Text>
              {!!item.originalPrice &&
                Number(item.originalPrice) > Number(item.price) && (
                  <Text
                    style={{
                      fontSize: smallFontSize,
                      fontWeight: "400",
                      color: "#919EAB",
                      textDecorationLine: "line-through",
                      marginTop: isStepperVariant ? 2 : exactScale(2),
                    }}
                  >
                    ₹{Number(item.originalPrice).toFixed(isStepperVariant ? 2 : 1)}
                  </Text>
                )}
            </View>
          </View>

          {isStepperVariant ? (
            <>
              {!!item.brand && (
                <Text
                  style={{
                    fontSize: smallFontSize,
                    fontWeight: "500",
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
                    fontSize: smallFontSize,
                    fontWeight: "400",
                    color: "#919EAB",
                    marginTop: 2,
                    marginBottom: 2,
                  }}
                  numberOfLines={1}
                >
                  {item.description || item.form}
                </Text>
              )}
            </>
          ) : (
            <>
              {/* Brand • Pack info */}
              {!!brandLine && (
                <Text
                  style={{
                    fontSize: smallFontSize,
                    fontWeight: "400",
                    color: "#637381",
                    marginTop: exactScale(4),
                    marginBottom: exactScale(8),
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
                  paddingHorizontal: exactScale(10),
                  paddingVertical: exactScale(3),
                }}
              >
                <Text
                  style={{
                    fontSize: moderateScale(12),
                    fontWeight: "500",
                    color: "#1C2024",
                  }}
                >
                  Qty: {qty}
                </Text>
              </View>
            </>
          )}
        </View>
      </Touchable>

      {/* Dashed divider */}
      <View
        style={{
          borderStyle: "dashed",
          borderWidth: 1,
          borderColor: "#EEEFF1",
          height: 0,
          marginVertical: isStepperVariant ? 12 : exactScale(12),
        }}
      />

      {isStepperVariant ? (
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
              onPress={() => setManualQty((q) => Math.max(1, q - 1))}
              style={{
                width: exactScale(36),
                height: exactScale(36),
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontSize: moderateScale(20, 0.1),
                  fontWeight: "500",
                  color: "#1C2024",
                }}
              >
                −
              </Text>
            </Touchable>
            <Text
              style={{
                fontSize: labelMdFontSize,
                fontWeight: "600",
                color: "#1C2024",
                paddingHorizontal: 8,
              }}
            >
              {manualQty}
            </Text>
            <Touchable
              onPress={() => setManualQty((q) => q + 1)}
              style={{
                width: exactScale(36),
                height: exactScale(36),
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontSize: moderateScale(20, 0.1),
                  fontWeight: "500",
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
              height: CART_BUTTON_HEIGHT,
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
                  fontSize: moderateScale(13, 0.1),
                  fontWeight: "600",
                  color: "#0F7635",
                }}
              >
                Add to cart
              </Text>
            )}
          </Touchable>
        </View>
      ) : cartItem ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', borderRadius: 10, overflow: 'hidden', backgroundColor: '#0F7635', height: CART_BUTTON_HEIGHT }}>
          <Touchable onPress={() => handleCounterChange(cartItem.quantity - 1)} disabled={counterPending} activeOpacity={0.7} style={{ width: 44, height: '100%', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: moderateScale(20), color: '#fff', fontWeight: '500', lineHeight: moderateScale(24) }}>−</Text>
          </Touchable>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            {counterPending
              ? <ActivityIndicator size="small" color="#fff" />
              : <Text style={{ fontSize: moderateScale(14), fontWeight: '700', color: '#fff' }}>{cartItem.quantity}</Text>
            }
          </View>
          <Touchable onPress={() => handleCounterChange(cartItem.quantity + 1)} disabled={counterPending} activeOpacity={0.7} style={{ width: 44, height: '100%', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: moderateScale(20), color: '#fff', fontWeight: '500', lineHeight: moderateScale(24) }}>+</Text>
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
            : <Text style={{ fontSize: moderateScale(14), fontWeight: '600', color: '#0F7635' }}>Add to cart</Text>
          }
        </Touchable>
      )}

      {/* Ordered X times + last ordered */}
      {(!!item.orderedTimes || !!item.lastOrdered) && (
        <View
          style={{ flexDirection: "row", alignItems: "center", marginTop: isStepperVariant ? 12 : exactScale(10) }}
        >
          <icons.trend_up
            width={14}
            height={14}
            fill="#0F7635"
            style={{ marginRight: isStepperVariant ? 6 : exactScale(6) }}
          />
          {!!item.orderedTimes && (
            <Text
              style={{
                fontSize: orderedFontSize,
                fontWeight: "600",
                color: "#0F7635",
              }}
            >
              Ordered {isStepperVariant ? String(item.orderedTimes).padStart(2, "0") : item.orderedTimes} times
            </Text>
          )}
          {!!item.lastOrdered && (
            <Text
              style={{
                fontSize: orderedFontSize,
                fontWeight: "500",
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
