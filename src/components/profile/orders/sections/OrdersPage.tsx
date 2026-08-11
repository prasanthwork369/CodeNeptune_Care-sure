import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { useOrders } from "@/src/hooks/queries/useOrders";
import {
  AddToCartInput,
  CartItem,
  UpdateCartItemInput,
} from "@/src/types/cart";
import { Order, OrderTabKey } from "@/src/types/order";
import { FlashList } from "@shopify/flash-list";
import React, { useCallback } from "react";
import { RefreshControl, Text, View } from "react-native";
import { MyOrdersSkeleton } from "../MyOrdersSkeleton";
import { RetryState } from "@/src/components/ui/RetryState";
import { orderStyles as s } from "../orders.styles";
import { OrderCard } from "./OrderCard";

interface OrdersPageProps {
  tabKey: OrderTabKey;
  params: Record<string, string>;
  width: number;
  // Cart comes from the parent so all pages share one subscription.
  cartItemsRef: React.RefObject<CartItem[]>;
  addItem: (input: AddToCartInput) => Promise<unknown>;
  updateItem: (itemId: string, input: UpdateCartItemInput) => Promise<unknown>;
  clearCart: () => Promise<unknown>;
}

// One pager page. Each holds its own query, which react-query already caches
// per status, so switching tabs re-uses the fetched list.
export const OrdersPage: React.FC<OrdersPageProps> = ({
  tabKey,
  params,
  width,
  cartItemsRef,
  addItem,
  updateItem,
  clearCart,
}) => {
  const adjustedBottom = useAdjustedBottomInset();
  const { orders, loading, refreshing, error, refetch } = useOrders(params);

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
    [addItem, updateItem, clearCart, cartItemsRef],
  );
  const keyExtractor = useCallback((item: Order) => item.id, []);

  return (
    <View style={{ width }}>
      {loading ? (
        <MyOrdersSkeleton />
      ) : error && orders.length === 0 ? (
        <RetryState
          title="Couldn't load orders"
          onRetry={() => void refetch()}
          retrying={refreshing}
        />
      ) : (
        <FlashList
          data={orders}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          drawDistance={300}
          overrideProps={{ initialDrawBatchSize: 8 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: 20,
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
                {tabKey === "all"
                  ? "Your orders will appear here"
                  : `No ${tabKey} orders yet`}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};
