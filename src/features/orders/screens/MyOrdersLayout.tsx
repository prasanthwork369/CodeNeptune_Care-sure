import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { SlidingTabs } from "@/src/components/ui/SlidingTabs";
import { useCart } from "@/src/hooks/queries/useCart";
import { usePagerTabs } from "@/src/hooks/ui/usePagerTabs";
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
        backgroundColor="#F5F6FB"
        borderColor="#919EAB33"
        indicatorInset={8}
        paddingVertical={18}
        labelStyle={[s.labelMd, { fontSize: 15 }]}
        progress={progress}
      />

      <View
        style={{ flex: 1 }}
        onLayout={(e) => setPageWidth(e.nativeEvent.layout.width)}
      >
        {pageWidth > 0 && (
          <Animated.ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            decelerationRate="fast"
            directionalLockEnabled
            disableIntervalMomentum
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
                <View key={tab.key} style={{ width: pageWidth }} />
              ),
            )}
          </Animated.ScrollView>
        )}
      </View>
    </View>
  );
};
