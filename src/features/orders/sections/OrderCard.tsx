import { AlreadyHaveItemsModal } from "@/src/features/orders/components/AlreadyHaveItemsModal";
import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { useNav } from "@/src/hooks/useNav";
import { Order, ORDER_STATUS } from "../types";
import {
  AddToCartInput,
  CartItem,
  UpdateCartItemInput,
} from "@/src/features/cart/types";
import { buildCartInputs } from "../utils/reorderCart";
import { formatOrderId } from "@/src/utils/order";
import { Image } from "expo-image";
import { HOME_IMAGES } from "@/src/constants/images";
import { usePrefetchOrder } from "@/src/features/orders/hooks/useOrderById";
import { orderStyles } from "../orders.styles";
import { styles as s } from "./OrderCard.styles";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, ImageBackground, Text, View } from "react-native";

function CorporateOrderBadge() {
  return (
    <ImageBackground
      source={HOME_IMAGES.corporateOrderBadge}
      style={s.corporateBadge}
      resizeMode="stretch"
    >
      <Text style={s.corporateBadgeText}>
        CORPORATE ORDER
      </Text>
    </ImageBackground>
  );
}

export interface OrderCardProps {
  order: Order;
  cartItemsRef: React.RefObject<CartItem[]>;
  addItem: (input: AddToCartInput) => Promise<unknown>;
  updateItem: (itemId: string, input: UpdateCartItemInput) => Promise<unknown>;
  clearCart: () => Promise<unknown>;
}

function StatusBadge({ status }: { status: number | undefined }) {
  const cfg = (status != null ? ORDER_STATUS[status] : undefined) ?? {
    label: "PENDING",
    bg: "#FFFBE8",
    text: "#92600A",
    border: "#FFE998",
  };
  return (
    <View
      style={[
        s.statusBadgeWrap,
        {
          backgroundColor: cfg.bg,
          borderColor: cfg.border,
        },
      ]}
    >
      <Text
        style={[
          s.statusBadgeText,
          { color: cfg.text },
        ]}
      >
        {cfg.label}
      </Text>
    </View>
  );
}

function formatDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export const OrderCard = React.memo(function OrderCard({
  order,
  cartItemsRef,
  addItem,
  updateItem,
  clearCart,
}: OrderCardProps) {
  const router = useNav();
  const prefetchOrder = usePrefetchOrder();
  const items = order.items ?? [];
  const thumbs = items.slice(0, 4);
  const extraCount = Math.max(0, items.length - 4);
  const showDetails = order.status !== 0;

  const [isProceeding, setIsProceeding] = useState(false);
  const [isCartModalVisible, setIsCartModalVisible] = useState(false);

  const handlePrefetch = useCallback(() => {
    if (order?.id) {
      prefetchOrder(order.id);
    }
  }, [prefetchOrder, order.id]);

  const addItemsToCart = async (replace: boolean) => {
    if (!items.length) return;
    setIsProceeding(true);
    try {
      if (replace) await clearCart();
      const inputs = await buildCartInputs(items);
      const currentCartItems = cartItemsRef.current ?? [];
      for (const input of inputs) {
        const existing = !replace
          ? currentCartItems.find((c) => c.medicineId === input.medicineId)
          : null;
        if (existing) {
          await updateItem(existing.id, {
            quantity: existing.quantity + input.quantity,
          });
        } else {
          await addItem(input);
        }
      }
      setIsCartModalVisible(false);
      setTimeout(() => {
        router.push("/(commerce)/cart");
        setIsProceeding(false);
      }, 100);
    } catch (err) {
      if (__DEV__) console.error("[OrderAgain]", err);
      setIsProceeding(false);
    }
  };

  const handleOrderAgain = () => {
    const currentCartItems = cartItemsRef.current ?? [];
    if (currentCartItems.length > 0) {
      setIsCartModalVisible(true);
    } else {
      addItemsToCart(false);
    }
  };

  return (
    <View style={s.card}>
      <Touchable
        activeOpacity={0.8}
        onPress={() =>
          router.push({
            pathname: "/profile/orders/track",
            params: { orderId: order.id },
          })
        }
        onPressIn={handlePrefetch}
      >
        {/* Top: dates + badge */}
        <View style={s.cardTop}>
          <View style={s.metaColsWrap}>
            <View>
              <Text style={s.metaLabel}>
                Order Created
              </Text>
              <Text style={s.metaValue}>
                {formatDate(order.createdAt)}
              </Text>
            </View>
            <View style={{ flexShrink: 1 }}>
              <Text style={s.metaLabel}>
                Order ID
              </Text>
              <Text
                style={s.metaValue}
                numberOfLines={1}
                adjustsFontSizeToFit={true}
                minimumFontScale={0.8}
              >
                {formatOrderId(order.orderId || order.id)}
              </Text>
            </View>
          </View>
          <StatusBadge status={order.status} />
        </View>

        {/* Items count */}
        <Text style={s.itemsCountText}>
          {items.length > 0
            ? `${items.length} Item${items.length > 1 ? "s" : ""}`
            : "—"}
        </Text>

        {/* Thumbnails */}
        {thumbs.length > 0 && (
          <View style={s.thumbsWrap}>
            {thumbs.map((item, i) => (
              <View key={i} style={s.thumbBox}>
                {item.medicineSnapshot?.image ? (
                  <Image
                    source={{ uri: item.medicineSnapshot.image }}
                    style={orderStyles.productImg52}
                    contentFit="contain"
                    cachePolicy="memory-disk"
                  />
                ) : (
                  <icons.placeholder width={52} height={52} />
                )}
              </View>
            ))}
            {extraCount > 0 && (
              <View style={s.thumbExtraBox}>
                <Text style={s.thumbExtraText}>
                  +{extraCount}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Delivery date + corporate badge */}
        {(order.estimatedDelivery || order.isCorporateGeneratedOrder) && (
          <View style={s.deliveryCorporateRow}>
            {order.estimatedDelivery ? (
              <View>
                <Text style={s.metaLabel}>
                  Delivery On
                </Text>
                <Text style={s.metaValue}>
                  {formatDate(order.estimatedDelivery)}
                </Text>
              </View>
            ) : (
              <View />
            )}
            {order.isCorporateGeneratedOrder && <CorporateOrderBadge />}
          </View>
        )}
      </Touchable>

      {/* Divider + Buttons */}
      <View style={s.dividerHorizontal} />
      <View style={s.actionsRow}>
        {showDetails && (
          <>
            <Touchable
              style={s.actionBtn}
              activeOpacity={0.7}
              onPress={() =>
                router.push({
                  pathname: "/profile/orders/track",
                  params: { orderId: order.id },
                })
              }
              onPressIn={handlePrefetch}
            >
              <Text style={s.actionBtnText}>
                Order Details
              </Text>
            </Touchable>
            <View style={s.dividerVertical} />
          </>
        )}
        <Touchable
          style={s.actionBtn}
          activeOpacity={0.7}
          onPress={handleOrderAgain}
          disabled={isProceeding}
        >
          {isProceeding ? (
            <View style={s.addingRow}>
              <ActivityIndicator size="small" color="#0F7635" />
              <Text style={s.addingText}>
                Adding...
              </Text>
            </View>
          ) : (
            <Text style={s.actionBtnText}>
              Order Again
            </Text>
          )}
        </Touchable>
      </View>

      <AlreadyHaveItemsModal
        visible={isCartModalVisible}
        onClose={() => setIsCartModalVisible(false)}
        onAdd={() => addItemsToCart(false)}
        onReplace={() => addItemsToCart(true)}
        isProceeding={isProceeding}
      />
    </View>
  );
});
