import type { FrequentOrderItem } from "@/src/features/orders/types";
import { asError } from "@/src/api/errors";
import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { useNav } from "@/src/hooks/useNav";
import { useMatchingCartItem } from "@/src/features/cart/hooks/useCartRead";
import { cartMutations } from "@/src/features/cart/services/cart.mutations";
import { QUERY_KEYS } from "@/src/lib/react-query/queryKeys";
import type { Cart } from "@/src/features/cart/types";
import { useCartPendingStore } from "@/src/store/cartStore";
import { useAuthStore } from "@/src/store/authStore";
import { resolveUUID } from "@/src/utils/resolveUUID";
import { Image } from "expo-image";
import React, { useState } from "react";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { ActivityIndicator, Alert, Text, View } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { logger } from "@/src/utils/logger";
import { styles as s } from "./ProductCard.styles";

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

export const ProductCard = React.memo(function ProductCard({
  item,
  variant = "cartCounter",
}: {
  item: FrequentOrderItem;
  index: number;
  variant?: ProductCardVariant;
}) {
  const isStepperVariant = variant === "preAddStepper";
  const router = useNav();
  const isAuthenticated = useAuthStore((st) => st.isAuthenticated);
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [manualQty, setManualQty] = useState(1);

  const productId = item.productId || item.id;
  const historyQty = item.lastQty ?? 1;
  const qty = isStepperVariant ? manualQty : historyQty;

  const cartItem = useMatchingCartItem(
    (c) =>
      c.medicineId === productId ||
      c.metadata?.productId === productId ||
      c.medicineId === item.id ||
      c.medicineId === item.medicineId,
  );
  const [counterPending, setCounterPending] = useState(false);

  const handleCounterChange = async (newQty: number) => {
    if (!cartItem || counterPending) return;
    setCounterPending(true);
    try {
      if (newQty <= 0) await cartMutations.removeItem(cartItem.id);
      else await cartMutations.updateItem(cartItem.id, { quantity: newQty });
    } finally {
      setCounterPending(false);
    }
  };

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      const snapshotItems = isAuthenticated
        ? (queryClient.getQueryData<Cart>(QUERY_KEYS.CUSTOMER.CART)?.items ??
          [])
        : useCartPendingStore.getState().guestCart.items;
      const existing = snapshotItems.find(
        (c) =>
          c.medicineId === productId || c.metadata?.productId === productId,
      );
      if (existing) {
        await cartMutations.updateItem(existing.id, {
          quantity: existing.quantity + qty,
        });
      } else {
        const itemId = String(
          item.medicineId ?? item.productId ?? item.id ?? "",
        ).trim();
        if (!itemId) {
          throw new Error(
            isStepperVariant
              ? "[FrequentlyOrdered] missing item id"
              : "[FrequentOrders] missing item id",
          );
        }
        const slug = isStepperVariant
          ? String(item.slug ?? "").trim() || itemId
          : String(item.slug ?? item.productId ?? item.id ?? "").trim() ||
            itemId;
        const name = isStepperVariant
          ? String(item.name ?? "").trim() || itemId
          : String(item.name ?? item.productId ?? item.id ?? "").trim() ||
            itemId;
        const price =
          Number(item.price ?? item.originalPrice ?? 0) ||
          Number(item.originalPrice ?? item.price ?? 0) ||
          1;

        const mrp = Number(item.originalPrice ?? price);
        const imageUri =
          item.image?.uri ??
          (typeof item.image === "string" ? item.image : undefined);
        const medicineId = await resolveUUID(itemId, slug, item.productId);
        if (!isStepperVariant && __DEV__)
          logger.debug("[FrequentOrders] resolved:", {
            itemId,
            slug,
            medicineId,
          });
        await cartMutations.addItem({
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
    } catch (e) {
      const err = asError(e);
      if (isStepperVariant) {
        if (__DEV__) logger.debug("[FrequentlyOrdered AddToCart] error:", err);
      } else {
        if (__DEV__)
          console.error(
            "[FrequentOrders AddToCart] error:",
            err?.message ?? err,
          );
        Alert.alert(
          "Failed",
          err?.message ?? "Could not add to cart. Please try again.",
        );
      }
    } finally {
      setIsAdding(false);
    }
  };

  const brandLine = [item.brand, item.description].filter(Boolean).join(" • ");

  const itemDiscount =
    item.discount ||
    (item.originalPrice && Number(item.originalPrice) > Number(item.price)
      ? `${Math.round(((Number(item.originalPrice) - Number(item.price)) / Number(item.originalPrice)) * 100)}% OFF`
      : undefined);

  const labelMdFontSize = moderateScale(14);
  const smallFontSize = moderateScale(11);
  const orderedFontSize = isStepperVariant
    ? moderateScale(13)
    : moderateScale(12);
  const imgSize = isStepperVariant ? exactScale(54) : 54;

  return (
    <View
      style={[
        s.card,
        {
          marginHorizontal: isStepperVariant ? 16 : exactScale(16),
          marginBottom: isStepperVariant ? 12 : exactScale(12),
          padding: isStepperVariant ? 16 : exactScale(16),
        },
      ]}
    >
      {/* Top row: image + info */}
      <Touchable
        activeOpacity={0.7}
        onPress={() =>
          router.push({ pathname: "/product/[id]", params: { id: productId } })
        }
        style={[
          s.topTouch,
          { marginBottom: isStepperVariant ? 12 : undefined },
        ]}
      >
        {/* Product image */}
        <View
          style={[
            s.imageBox,
            {
              width: isStepperVariant ? 100 : 80,
              height: isStepperVariant ? 100 : 80,
              marginRight: isStepperVariant ? 12 : exactScale(12),
              position: isStepperVariant ? "relative" : undefined,
            },
          ]}
        >
          {isStepperVariant && !!itemDiscount && (
            <View style={s.discountBadge}>
              <Text style={s.discountText}>
                {itemDiscount}
              </Text>
            </View>
          )}
          {typeof item.image === "number" || (item.image && !item.image.uri) ? (
            <Image
              source={item.image}
              style={{
                width: imgSize,
                height: imgSize,
                marginTop: isStepperVariant && itemDiscount ? 26 : 0,
              }}
              contentFit="contain"
              cachePolicy="memory-disk"
            />
          ) : item.image?.uri ? (
            <Image
              source={{ uri: item.image.uri }}
              style={{
                width: imgSize,
                height: imgSize,
                marginTop: isStepperVariant && itemDiscount ? 26 : 0,
              }}
              contentFit="contain"
              cachePolicy="memory-disk"
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
          <View style={s.namePriceRow}>
            <Text
              style={[
                s.nameText,
                {
                  fontSize: labelMdFontSize,
                  paddingRight: isStepperVariant ? 8 : exactScale(8),
                },
              ]}
              numberOfLines={2}
            >
              {item.name}
            </Text>
            {/* Price */}
            <View style={s.priceCol}>
              <Text
                style={[
                  s.sellingPriceText,
                  {
                    fontSize: labelMdFontSize,
                    color: isStepperVariant ? "#1C2024" : "#0F7635",
                  },
                ]}
              >
                ₹{Number(item.price).toFixed(isStepperVariant ? 2 : 1)}
              </Text>
              {!!item.originalPrice &&
                Number(item.originalPrice) > Number(item.price) && (
                  <Text
                    style={[
                      s.mrpPriceText,
                      {
                        fontSize: smallFontSize,
                        marginTop: isStepperVariant ? 2 : exactScale(2),
                      },
                    ]}
                  >
                    ₹
                    {Number(item.originalPrice).toFixed(
                      isStepperVariant ? 2 : 1,
                    )}
                  </Text>
                )}
            </View>
          </View>

          {isStepperVariant ? (
            <>
              {!!item.brand && (
                <Text
                  style={[
                    s.brandTextStepper,
                    { fontSize: smallFontSize },
                  ]}
                  numberOfLines={1}
                >
                  {item.brand}
                </Text>
              )}
              {!!item.description && (
                <Text
                  style={[
                    s.descTextStepper,
                    { fontSize: smallFontSize },
                  ]}
                  numberOfLines={1}
                >
                  {item.description}
                </Text>
              )}
            </>
          ) : (
            <>
              {/* Brand • Pack info */}
              {!!brandLine && (
                <Text
                  style={[
                    s.brandLineText,
                    {
                      fontSize: smallFontSize,
                      marginTop: exactScale(4),
                      marginBottom: exactScale(8),
                    },
                  ]}
                  numberOfLines={1}
                >
                  {brandLine}
                </Text>
              )}

              {/* Qty badge */}
              <View
                style={[
                  s.qtyBadgeBox,
                  {
                    paddingHorizontal: exactScale(10),
                    paddingVertical: exactScale(3),
                  },
                ]}
              >
                <Text style={s.qtyBadgeText}>
                  Qty: {qty}
                </Text>
              </View>
            </>
          )}
        </View>
      </Touchable>

      <View
        style={[
          s.dividerDashed,
          { marginVertical: isStepperVariant ? 12 : exactScale(12) },
        ]}
      />

      {isStepperVariant ? (
        <View style={s.stepperRow}>
          <View style={s.stepperBox}>
            <Touchable
              onPress={() => setManualQty((q) => Math.max(1, q - 1))}
              style={s.stepperBtn}
            >
              <Text style={s.stepperBtnText}>
                −
              </Text>
            </Touchable>
            <Text
              style={[
                s.stepperValueText,
                { fontSize: labelMdFontSize },
              ]}
            >
              {manualQty}
            </Text>
            <Touchable
              onPress={() => setManualQty((q) => q + 1)}
              style={s.stepperBtn}
            >
              <Text style={s.stepperBtnText}>
                +
              </Text>
            </Touchable>
          </View>
          <Touchable
            style={s.stepperAddBtn}
            activeOpacity={0.6}
            onPress={handleAddToCart}
            disabled={isAdding}
          >
            {isAdding ? (
              <ActivityIndicator size="small" color="#0F7635" />
            ) : (
              <Text style={s.stepperAddBtnText}>
                Add to cart
              </Text>
            )}
          </Touchable>
        </View>
      ) : cartItem ? (
        <View style={s.counterPill}>
          <Touchable
            onPress={() => handleCounterChange(cartItem.quantity - 1)}
            disabled={counterPending}
            activeOpacity={0.7}
            style={s.counterBtn}
          >
            <Text style={s.counterBtnText}>
              −
            </Text>
          </Touchable>
          <View style={s.counterValueCol}>
            {counterPending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={s.counterValueText}>
                {cartItem.quantity}
              </Text>
            )}
          </View>
          <Touchable
            onPress={() => handleCounterChange(cartItem.quantity + 1)}
            disabled={counterPending}
            activeOpacity={0.7}
            style={s.counterBtn}
          >
            <Text style={s.counterBtnText}>
              +
            </Text>
          </Touchable>
        </View>
      ) : (
        <Touchable
          style={s.addBtn}
          activeOpacity={0.85}
          onPress={handleAddToCart}
          disabled={isAdding}
        >
          {isAdding ? (
            <ActivityIndicator size="small" color="#0F7635" />
          ) : (
            <Text style={s.addBtnText}>
              ADD
            </Text>
          )}
        </Touchable>
      )}

      {/* Ordered X times + last ordered */}
      {(!!item.orderedTimes || !!item.lastOrdered) && (
        <View
          style={[
            s.orderedRow,
            { marginTop: isStepperVariant ? 12 : exactScale(10) },
          ]}
        >
          <icons.trend_up
            width={14}
            height={14}
            fill="#0F7635"
            style={{ marginRight: isStepperVariant ? 6 : exactScale(6) }}
          />
          {!!item.orderedTimes && (
            <Text
              style={[
                s.orderedText,
                { fontSize: orderedFontSize },
              ]}
            >
              Ordered{" "}
              {isStepperVariant
                ? String(item.orderedTimes).padStart(2, "0")
                : item.orderedTimes}{" "}
              times
            </Text>
          )}
          {!!item.lastOrdered && (
            <Text
              style={[
                s.lastOrderedText,
                {
                  fontSize: orderedFontSize,
                  marginLeft: item.orderedTimes ? 8 : 0,
                },
              ]}
            >
              Last ordered: {formatDate(item.lastOrdered)}
            </Text>
          )}
        </View>
      )}
    </View>
  );
});
ProductCard.displayName = "ProductCard";
