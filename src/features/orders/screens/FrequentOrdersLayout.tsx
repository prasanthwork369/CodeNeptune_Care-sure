import type { FrequentOrderItem } from "@/src/features/orders/types";
import { NoInternetState } from "@/src/components/ui/NoInternetState";
import { RetryState } from "@/src/components/ui/RetryState";
import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { ShimmerBlock } from "@/src/components/ui/shimmer";
import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { useNav } from "@/src/hooks/useNav";
import { useCart } from "@/src/features/cart/hooks/useCart";
import { useFrequentlyOrdered } from "@/src/features/orders/hooks/useOrders";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { useLiveScreenState } from "@/src/hooks/ui/useLiveScreenState";
import { AppFlashList } from "@/src/components/lists/AppFlashList";
import { ProductCard } from "../sections/frequent";
import { exactScale } from "@/src/utils/exactScale";
import { styles as s } from "./FrequentOrdersLayout.styles";
import React, { useCallback, useMemo, useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";

export const FrequentOrdersLayout: React.FC = () => {
  const router = useNav();
  const adjustedBottom = useAdjustedBottomInset();
  const { cartLineCount } = useCart();
  const {
    data: frequentlyOrdered = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useFrequentlyOrdered();
  const liveState = useLiveScreenState({
    error,
    hasData: frequentlyOrdered.length > 0,
    loading: isLoading,
  });
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const displayProducts = frequentlyOrdered;

  const categories: string[] = useMemo(() => {
    const cats = displayProducts.map((p) => p.category.trim()).filter(Boolean);
    const unique = Array.from(new Set<string>(cats));
    return unique.length > 0 ? ["All", ...unique] : [];
  }, [displayProducts]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return displayProducts.filter((p) => {
      const matchSearch =
        !q ||
        p.name?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q);
      const pCat = p.category.trim();
      const matchFilter = activeFilter === "All" || pCat === activeFilter;
      return matchSearch && matchFilter;
    });
  }, [displayProducts, search, activeFilter]);

  const renderProduct = useCallback(
    ({ item, index }: { item: FrequentOrderItem; index: number }) => (
      <ProductCard item={item} index={index} />
    ),
    [],
  );

  const keyExtractor = useCallback((item: FrequentOrderItem) => item.id, []);

  if (liveState) {
    return (
      <View style={s.root}>
        <ScreenHeader title="Frequently Ordered List" backgroundColor="#FFFFFF" />
        {liveState === "offline" ? (
          <NoInternetState onRetry={() => void refetch()} retrying={isFetching} />
        ) : (
          <RetryState
            title="Couldn't load your products"
            onRetry={() => void refetch()}
            retrying={isFetching}
          />
        )}
      </View>
    );
  }

  return (
    <View style={s.root}>
      <ScreenHeader
        title="Frequently Ordered List"
        backgroundColor="#FFFFFF"
        rightSlot={
          <View style={s.cartBtnWrap}>
            <Touchable
              style={s.cartBtn}
              onPress={() => router.push("/(commerce)/cart")}
            >
              <icons.cart_svg width={24} height={24} fill="#222222" />
            </Touchable>
            {cartLineCount > 0 && (
              <View
                pointerEvents="none"
                style={s.cartBadge}
              >
                <Text style={s.cartBadgeText}>
                  {cartLineCount}
                </Text>
              </View>
            )}
          </View>
        }
      />

      {/* Search bar */}
      {frequentlyOrdered.length > 0 && (
        <View style={s.searchBarWrap}>
          <View style={s.searchBox}>
            <icons.search
              width={18}
              height={18}
              style={s.searchIcon}
            />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search your ordered products..."
              placeholderTextColor="#6A6A6A"
              style={s.searchInput}
              returnKeyType="done"
              autoCorrect={false}
              autoCapitalize="none"
            />
            {!!search && (
              <Touchable
                onPress={() => setSearch("")}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <icons.close_dark width={16} height={16} fill="#919EAB" />
              </Touchable>
            )}
          </View>
        </View>
      )}

      {/* Category filter chips */}
      {categories.length > 1 && (
        <View style={s.categoryFilterWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.categoryFilterContent}
          >
            {categories.map((cat) => {
              const active = activeFilter === cat;
              return (
                <Touchable
                  key={cat}
                  onPress={() => setActiveFilter(cat)}
                  activeOpacity={0.7}
                  style={[
                    s.chip,
                    active ? s.chipActive : s.chipInactive,
                  ]}
                >
                  <Text
                    style={[
                      s.chipText,
                      active ? s.chipTextActive : s.chipTextInactive,
                    ]}
                  >
                    {cat}
                  </Text>
                </Touchable>
              );
            })}
          </ScrollView>
        </View>
      )}

      <View style={s.divider} />

      {isLoading ? (
        <View style={s.shimmerList}>
          <ShimmerBlock height={exactScale(96)} borderRadius={12} />
          <ShimmerBlock height={exactScale(96)} borderRadius={12} />
          <ShimmerBlock height={exactScale(96)} borderRadius={12} />
        </View>
      ) : filtered.length === 0 ? (
        <View
          style={[
            s.emptyWrap,
            { paddingBottom: adjustedBottom + exactScale(80) },
          ]}
        >
          <Text style={s.emptyTitle}>
            {search || activeFilter !== "All"
              ? "No products found"
              : "No frequently ordered products yet"}
          </Text>
          <Text style={s.emptySubtitle}>
            {search || activeFilter !== "All"
              ? "Try a different name or filter"
              : "Your frequently ordered products will appear here"}
          </Text>
        </View>
      ) : (
        <AppFlashList
          data={filtered}
          renderItem={renderProduct}
          keyExtractor={keyExtractor}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            s.listContent,
            { paddingBottom: adjustedBottom + exactScale(32) },
          ]}
        />
      )}
    </View>
  );
};
