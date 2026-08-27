/* eslint-disable react-hooks/refs */
import { NoInternetState } from "@/src/components/ui/NoInternetState";
import { RetryState } from "@/src/components/ui/RetryState";
import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { SlidingTabs } from "@/src/components/ui/SlidingTabs";
import { useCart } from "@/src/features/cart/hooks/useCart";
import { useOrders } from "@/src/features/orders/hooks/useOrders";
import { usePagerTabs } from "@/src/hooks/ui/usePagerTabs";
import { useLiveScreenState } from "@/src/hooks/ui/useLiveScreenState";
import { AddToCartInput, UpdateCartItemInput } from "@/src/features/cart/types";
import { OrderTabKey } from "../types";
import React, { useCallback, useRef } from "react";
import { View } from "react-native";
import Animated from "react-native-reanimated";
import { orderStyles as s } from "../orders.styles";
import { OrdersPage } from "../sections/OrdersPage";

const TABS: {
  key: OrderTabKey;
  label: string;
  params: Record<string, string>;
}[] = [
  { key: "all", label: "All Orders", params: {} },
  { key: "delivered", label: "Delivered", params: { status: "7" } },
  { key: "cancelled", label: "Cancelled", params: { status: "0" } },
];

const TAB_KEYS = TABS.map((t) => t.key);

export const MyOrdersLayout: React.FC = () => {
  const {
    scrollRef,
    scrollHandler,
    handleMomentumScrollEnd,
    handleScrollEndDrag,
    progress,
    pageWidth,
    setPageWidth,
    activeKey,
    visitedKeys,
    goToTab,
  } = usePagerTabs(TAB_KEYS);

  // One cart subscription for every page, so a cart change re-renders once.
  const cart = useCart();
  const cartItemsRef = useRef(cart.items);
  cartItemsRef.current = cart.items;

  // Called through a ref, since useCart's fresh arrows defeated OrderCard's memo.
  const cartRef = useRef(cart);
  cartRef.current = cart;
  const addItem = useCallback(
    (input: AddToCartInput) => cartRef.current.addItem(input),
    [],
  );
  const updateItem = useCallback(
    (itemId: string, input: UpdateCartItemInput) =>
      cartRef.current.updateItem(itemId, input),
    [],
  );
  const clearCart = useCallback(() => cartRef.current.clearCart(), []);

  // The All tab's query, read here as the screen-level signal for "is there any
  // order data at all". Same query key the All page uses, so React Query serves
  // both observers from one cache entry — no extra request. Holding an observer
  // at this level is also what lets the screen recover on its own: it keeps the
  // query subscribed while the pages below are unmounted, so onlineManager's
  // reconnect refetch has something to refetch.
  const {
    orders: allOrders,
    loading: allLoading,
    refreshing: allRefreshing,
    error: allError,
    refetch: refetchAll,
  } = useOrders(TABS[0].params);
  const liveState = useLiveScreenState({
    error: allError,
    hasData: allOrders.length > 0,
    loading: allLoading,
  });

  // Orders is live: statuses move server-side, so offline replaces the screen
  // rather than showing a cached list that may already be wrong. Online, this
  // fires only with nothing to show — a per-tab failure still belongs to that
  // tab, since one failed status filter says nothing about the others.
  if (liveState) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F5F6FB" }}>
        <ScreenHeader
          title="My Orders"
          showBorder={true}
          backgroundColor="#FFFFFF"
        />
        {liveState === "offline" ? (
          <NoInternetState
            onRetry={() => void refetchAll()}
            retrying={allRefreshing}
          />
        ) : (
          <RetryState
            title="Couldn't load orders"
            onRetry={() => void refetchAll()}
            retrying={allRefreshing}
          />
        )}
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F6FB" }}>
      <ScreenHeader
        title="My Orders"
        showBorder={true}
        backgroundColor="#FFFFFF"
      />

      <SlidingTabs
        tabs={TABS}
        activeKey={activeKey}
        onTabPress={goToTab}
        backgroundColor="#FFFFFF"
        borderColor="#919EAB33"
        indicatorInset={8}
        paddingVertical={18}
        labelStyle={[s.labelMd, { fontSize: 15 }]}
        progress={progress}
      />

      <View
        style={{ flex: 1, backgroundColor: "#F5F6FB" }}
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width;
          if (w > 0 && w !== pageWidth) setPageWidth(w);
        }}
      >
        {pageWidth > 0 && (
          <Animated.ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={scrollHandler}
            onMomentumScrollEnd={handleMomentumScrollEnd}
            onScrollEndDrag={handleScrollEndDrag}
            scrollEventThrottle={16}
            decelerationRate="fast"
            directionalLockEnabled
            disableIntervalMomentum
            style={{ flex: 1, backgroundColor: "#F5F6FB" }}
            contentContainerStyle={{ backgroundColor: "#F5F6FB" }}
          >
            {TABS.map((tab) =>
              visitedKeys.includes(tab.key) ? (
                <OrdersPage
                  key={tab.key}
                  tabKey={tab.key}
                  params={tab.params}
                  width={pageWidth}
                  cartItemsRef={cartItemsRef}
                  addItem={addItem}
                  updateItem={updateItem}
                  clearCart={clearCart}
                />
              ) : (
                <View
                  key={tab.key}
                  style={{ width: pageWidth, flex: 1, backgroundColor: "#F5F6FB" }}
                />
              ),
            )}
          </Animated.ScrollView>
        )}
      </View>
    </View>
  );
};
