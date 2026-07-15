import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { SlidingTabs } from "@/src/components/ui/SlidingTabs";
import { useCart } from "@/src/hooks/queries/useCart";
import { usePagerTabs } from "@/src/hooks/ui/usePagerTabs";
import { OrderTabKey } from "@/src/types/order";
import React, { useRef } from "react";
import { View } from "react-native";
import Animated from "react-native-reanimated";
import { orderStyles as s } from "./orders.styles";
import { OrdersPage } from "./sections/OrdersPage";

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
  const { items: cartItems, addItem, updateItem, clearCart } = useCart();
  const cartItemsRef = useRef(cartItems);
  cartItemsRef.current = cartItems;

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
        labelStyle={s.labelMd}
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
            // Keeps each page pinned to the viewport width.
            decelerationRate="fast"
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
