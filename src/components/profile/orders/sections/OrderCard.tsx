import { AlreadyHaveItemsModal } from "@/src/components/prescription/AlreadyHaveItemsModal";
import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { useCart } from "@/src/hooks/queries/useCart";
import { useNav } from "@/src/hooks/useNav";
import { Order, ORDER_STATUS } from "@/src/types/order";
import { buildCartInputs } from "@/src/utils/reorderCart";
import { Image } from "expo-image";
import React, { useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { orderStyles as s } from "../orders.styles";

const labelStyle = { letterSpacing: 0.6 };
const valueStyle = { marginTop: 3 };

function StatusBadge({ status }: { status: number | undefined }) {
  const cfg = (status != null ? ORDER_STATUS[status] : undefined) ?? {
    label: "PENDING",
    bg: "#FFFBE8",
    text: "#92600A",
    border: "#FFE998",
  };
  return (
    <View
      style={{
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 5,
        backgroundColor: cfg.bg,
        borderWidth: 1,
        borderColor: cfg.border,
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 10,
      }}
    >
      <Text
        className="font-inter-bold"
        style={[s.statusBadge, { color: cfg.text, letterSpacing: 0.4 }]}
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

export const OrderCard = React.memo(function OrderCard({ order }: { order: Order }) {
  const router = useNav();
  const items = order.items ?? [];
  const thumbs = items.slice(0, 4);
  const extraCount = Math.max(0, items.length - 4);
  const showDetails = true;

  const { items: cartItems, addItem, updateItem, clearCart } = useCart();
  const [isProceeding, setIsProceeding] = useState(false);
  const [isCartModalVisible, setIsCartModalVisible] = useState(false);

  const addItemsToCart = async (replace: boolean) => {
    if (!items.length) return;
    setIsProceeding(true);
    try {
      if (replace) await clearCart();
      const inputs = await buildCartInputs(items);
      for (const input of inputs) {
        const existing = !replace
          ? cartItems.find((c) => c.medicineId === input.medicineId)
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
      setIsProceeding(false);
      setTimeout(() => router.push("/(modal)/cart" as any), 100);
    } catch (err) {
      if (__DEV__) console.error("[OrderAgain]", err);
      setIsProceeding(false);
    }
  };

  const handleOrderAgain = () => {
    if (cartItems.length > 0) {
      setIsCartModalVisible(true);
    } else {
      addItemsToCart(false);
    }
  };

  return (
    <View
      style={{
        backgroundColor: "#fff",
        borderRadius: 14,
        marginHorizontal: 16,
        marginBottom: 12,
      }}
    >
      <Touchable
        activeOpacity={0.8}
        onPress={() =>
          router.push({
            pathname: "/profile/orders/track",
            params: { orderId: order.id },
          } as any)
        }
      >
        {/* Top: dates + badge */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 10,
          }}
        >
          <View style={{ flexDirection: "row", gap: 20, paddingRight: 110 }}>
            <View>
              <Text
                className="font-inter-semibold text-[#6A6A6A] uppercase"
                style={[s.labelXs, labelStyle]}
              >
                Order Created
              </Text>
              <Text
                className="font-inter-bold text-[#222222]"
                style={[s.labelSm, valueStyle]}
              >
                {formatDate(order.createdAt)}
              </Text>
            </View>
            <View style={{ flexShrink: 1 }}>
              <Text
                className="font-inter-semibold text-[#6A6A6A] uppercase"
                style={[s.labelXs, labelStyle]}
              >
                Order ID
              </Text>
              <Text
                className="font-inter-bold text-[#222222]"
                style={[s.labelSm, valueStyle]}
                numberOfLines={1}
                adjustsFontSizeToFit={true}
                minimumFontScale={0.8}
              >
                {String(order.orderId).replace(/[^a-zA-Z_]/g, '') +"-"+ String(order.orderId).slice(-6).toUpperCase()}
              </Text>
            </View>
          </View>
          <StatusBadge status={order.status} />
        </View>

        {/* Items count */}
        <Text
          className="font-inter-semibold text-[#6A6A6A] uppercase px-4 mb-2.5"
          style={[s.labelXs, labelStyle]}
        >
          {items.length > 0
            ? `${items.length} Item${items.length > 1 ? "s" : ""}`
            : "—"}
        </Text>

        {/* Thumbnails */}
        {thumbs.length > 0 && (
          <View
            style={{
              flexDirection: "row",
              paddingHorizontal: 16,
              gap: 12,
              marginBottom: 12,
            }}
          >
            {thumbs.map((item, i) => (
              <View
                key={i}
                style={{
                  flex: 1,
                  aspectRatio: 1,
                  maxWidth: 62,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: "#EEEFF1",
                  backgroundColor: "#FAFAFA",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {item.medicineSnapshot?.image ? (
                  <Image
                    source={{ uri: item.medicineSnapshot.image }}
                    style={s.productImg52}
                    contentFit="contain"
                  />
                ) : (
                  <icons.placeholder width={52} height={52} />
                )}
              </View>
            ))}
            {extraCount > 0 && (
              <View
                style={{
                  flex: 1,
                  aspectRatio: 1,
                  maxWidth: 62,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: "#EEEFF1",
                  backgroundColor: "#fff",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={[
                    s.labelMd,
                    {
                      fontSize: 18,
                      fontWeight: "600",
                      color: "#222222",
                    },
                  ]}
                >
                  +{extraCount}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Delivery date */}
        {order.estimatedDelivery && (
          <View style={{ paddingHorizontal: 16, paddingBottom: 14 }}>
            <Text
              className="font-inter-medium text-[#6A6A6A] uppercase"
              style={[s.labelXs, labelStyle]}
            >
              Delivery On
            </Text>
            <Text
              className="font-inter-bold text-[#222222]"
              style={[s.labelSm, valueStyle]}
            >
              {formatDate(order.estimatedDelivery)}
            </Text>
          </View>
        )}
      </Touchable>

      {/* Divider + Buttons */}
      <View style={{ height: 1, backgroundColor: "#919EAB33" }} />
      <View style={{ flexDirection: "row" }}>
        {showDetails && (
          <>
            <Touchable
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 14,
              }}
              activeOpacity={0.7}
              onPress={() =>
                router.push({
                  pathname: "/profile/orders/track",
                  params: { orderId: order.id },
                } as any)
              }
            >
              <Text
                style={s.labelMd}
                className="font-inter-bold text-brand-primary"
              >
                Order Details
              </Text>
            </Touchable>
            <View style={{ width: 1, backgroundColor: "#919EAB33" }} />
          </>
        )}
        <Touchable
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 14,
          }}
          activeOpacity={0.7}
          onPress={handleOrderAgain}
          disabled={isProceeding}
        >
          {isProceeding ? (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <ActivityIndicator size="small" color="#0F7635" />
              <Text
                style={s.labelSm}
                className="font-inter-semibold text-brand-primary"
              >
                Adding...
              </Text>
            </View>
          ) : (
            <Text
              style={s.labelMd}
              className="font-inter-bold text-brand-primary"
            >
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
