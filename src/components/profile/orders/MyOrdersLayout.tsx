import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { Touchable } from "@/src/components/ui/Touchable";
import { useCart } from "@/src/hooks/queries/useCart";
import { useOrders } from "@/src/hooks/queries/useOrders";
import { Order, OrderTabKey } from "@/src/types/order";
import { FlashList } from "@shopify/flash-list";
import React, { useCallback, useRef, useState } from "react";
import { RefreshControl, Text, View } from "react-native";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { MyOrdersSkeleton } from "./MyOrdersSkeleton";
import { orderStyles as s } from "./orders.styles";
import { OrderCard } from "./sections/OrderCard";

const TABS: { key: OrderTabKey; label: string }[] = [
  { key: "all", label: "All Orders" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

export const MyOrdersLayout: React.FC = () => {
  const adjustedBottom = useAdjustedBottomInset();
  const [activeTab, setActiveTab] = useState<OrderTabKey>("all");

  const statusParam =
    activeTab === "delivered"
      ? { status: "7" }
      : activeTab === "cancelled"
        ? { status: "0" }
        : {};

  const {
    orders: filtered,
    loading,
    refreshing,
    refetch,
  } = useOrders(statusParam);

  const { items: cartItems, addItem, updateItem, clearCart } = useCart();
  const cartItemsRef = useRef(cartItems);
  cartItemsRef.current = cartItems;

  const renderItem = useCallback(
    ({ item }: { item: Order }) => (
      <OrderCard
        order={item}
        cartItemsRef={cartItemsRef}
        addItem={addItem}
        updateItem={updateItem}
        clearCart={clearCart}
      />
    ),
    [addItem, updateItem, clearCart],
  );
  const keyExtractor = useCallback((item: Order) => item.id, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F6FB" }}>
      <ScreenHeader
        title="My Orders"
        showBorder={true}
        backgroundColor="#FFFFFF"
      />

      {/* Tabs */}
      <View
        style={{
          flexDirection: "row",
          backgroundColor: "#fff",
          borderBottomWidth: 1,
          borderBottomColor: "#EEEFF1",
        }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <Touchable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.7}
              style={{ flex: 1, alignItems: "center", paddingVertical: 14 }}
            >
              <Text
                style={[
                  s.labelMd,
                  {
                    fontWeight: isActive ? "700" : "500",
                    color: isActive ? "#0F7635" : "#6A6A6A",
                  },
                ]}
              >
                {tab.label}
              </Text>
              {isActive && (
                <View
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    backgroundColor: "#0F7635",
                    borderTopLeftRadius: 4,
                    borderTopRightRadius: 4,
                  }}
                />
              )}
            </Touchable>
          );
        })}
      </View>

      {loading ? (
        <MyOrdersSkeleton />
      ) : (
        <FlashList
          data={filtered}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          drawDistance={300}
          overrideProps={{ initialDrawBatchSize: 8 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: 12,
            paddingBottom: adjustedBottom + 24,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refetch}
              colors={["#0F7635"]}
              tintColor="#0F7635"
            />
          }
          ListEmptyComponent={
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                paddingTop: 60,
              }}
            >
              <Text
                style={[
                  s.labelLg,
                  {
                    fontWeight: "600",
                    color: "#6A6A6A",
                  },
                ]}
              >
                No orders found
              </Text>
              <Text
                style={[
                  s.labelSm,
                  {
                    fontWeight: "400",
                    color: "#6A6A6A",
                    marginTop: 6,
                  },
                ]}
              >
                {activeTab === "all"
                  ? "Your orders will appear here"
                  : `No ${activeTab} orders yet`}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};
