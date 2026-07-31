import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { ShimmerBlock } from "@/src/components/ui/shimmer";
import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { useNav } from "@/src/hooks/useNav";
import { useCart } from "@/src/hooks/queries/useCart";
import { useFrequentlyOrdered } from "@/src/hooks/queries/useOrders";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { FlashList } from "@shopify/flash-list";
import React, { useCallback, useMemo, useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";
import { ProductCard } from "./sections";
import { exactScale, moderateScale } from "@/src/utils/exactScale";

export const FrequentOrdersLayout: React.FC = () => {
  const router = useNav();
  const adjustedBottom = useAdjustedBottomInset();
  const { totalItems } = useCart();
  const { data: frequentlyOrdered = [], isLoading } = useFrequentlyOrdered();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const displayProducts = frequentlyOrdered;

  const categories: string[] = useMemo(() => {
    const cats = displayProducts
      .map((p: any) => {
        if (!p.category) return "";
        if (typeof p.category === "object") {
          return p.category.name ?? p.category.title ?? "";
        }
        return String(p.category).trim();
      })
      .filter(Boolean);
    const unique = Array.from(new Set<string>(cats));
    return unique.length > 0 ? ["All", ...unique] : [];
  }, [displayProducts]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return displayProducts.filter((p: any) => {
      const matchSearch =
        !q ||
        p.name?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q);
      const pCat = !p.category
        ? ""
        : typeof p.category === "object"
          ? (p.category.name ?? p.category.title ?? "")
          : String(p.category).trim();
      const matchFilter = activeFilter === "All" || pCat === activeFilter;
      return matchSearch && matchFilter;
    });
  }, [displayProducts, search, activeFilter]);

  const renderProduct = useCallback(
    ({ item, index }: { item: any; index: number }) => (
      <ProductCard item={item} index={index} />
    ),
    [],
  );

  const keyExtractor = useCallback(
    (item: any, index: number) => `${item.productId ?? item.id}-${index}`,
    [],
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F6FB" }}>
      <ScreenHeader
        title="Frequently Ordered List"
        backgroundColor="#FFFFFF"
        rightSlot={
          <View style={{ position: "relative" }}>
            <Touchable
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: "#fff",
                borderWidth: 1,
                borderColor: "#919EAB33",
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={() => router.push("/(stack)/cart")}
            >
              <icons.cart_svg width={24} height={24} fill="#222222" />
            </Touchable>
            {totalItems > 0 && (
              <View
                pointerEvents="none"
                style={{
                  position: "absolute",
                  top: -4,
                  right: -4,
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: "#C22923",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: moderateScale(10),
                    fontWeight: "700",
                    color: "#fff",
                  }}
                >
                  {totalItems}
                </Text>
              </View>
            )}
          </View>
        }
      />

      {/* Search bar */}
      {frequentlyOrdered.length > 0 && (
        <View
          style={{
            paddingHorizontal: exactScale(16),
            paddingTop: exactScale(12),
            paddingBottom: exactScale(10),
            backgroundColor: "#fff",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#F5F6FB",
              borderRadius: 8,
              borderWidth: 1,
              borderColor: "#EEEFF1",
              height: 46,
              paddingHorizontal: exactScale(12),
            }}
          >
            <icons.search
              width={18}
              height={18}
              style={{ marginRight: exactScale(8) }}
            />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search your ordered products..."
              placeholderTextColor="#6A6A6A"
              style={{
                flex: 1,
                fontSize: moderateScale(14),
                fontWeight: "400",
                color: "#1C2024",
                paddingVertical: 0,
              }}
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
        <View
          style={{ backgroundColor: "#fff", paddingBottom: exactScale(10) }}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: exactScale(16),
              gap: exactScale(8),
              alignItems: "center",
            }}
          >
            {categories.map((cat) => {
              const active = activeFilter === cat;
              return (
                <Touchable
                  key={cat}
                  onPress={() => setActiveFilter(cat)}
                  activeOpacity={0.7}
                  style={{
                    paddingHorizontal: exactScale(16),
                    paddingVertical: exactScale(6),
                    borderRadius: 20,
                    backgroundColor: active ? "#0F7635" : "#F5F6FB",
                    borderWidth: 1,
                    borderColor: active ? "#0F7635" : "#EEEFF1",
                  }}
                >
                  <Text
                    style={{
                      fontSize: moderateScale(13),
                      fontWeight: active ? "600" : "500",
                      color: active ? "#fff" : "#637381",
                    }}
                  >
                    {cat}
                  </Text>
                </Touchable>
              );
            })}
          </ScrollView>
        </View>
      )}

      <View style={{ height: 1, backgroundColor: "#F0F1F3" }} />

      {isLoading ? (
        <View
          style={{
            paddingHorizontal: exactScale(16),
            paddingTop: exactScale(14),
            gap: exactScale(12),
          }}
        >
          <ShimmerBlock height={exactScale(96)} borderRadius={12} />
          <ShimmerBlock height={exactScale(96)} borderRadius={12} />
          <ShimmerBlock height={exactScale(96)} borderRadius={12} />
        </View>
      ) : filtered.length === 0 ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: exactScale(32),
            paddingBottom: adjustedBottom + exactScale(80),
          }}
        >
          <Text
            style={{
              fontSize: moderateScale(16),
              fontWeight: "600",
              color: "#637381",
              textAlign: "center",
            }}
          >
            {search || activeFilter !== "All"
              ? "No products found"
              : "No frequently ordered products yet"}
          </Text>
          <Text
            style={{
              fontSize: moderateScale(13),
              fontWeight: "400",
              color: "#919EAB",
              marginTop: exactScale(6),
              textAlign: "center",
            }}
          >
            {search || activeFilter !== "All"
              ? "Try a different name or filter"
              : "Your frequently ordered products will appear here"}
          </Text>
        </View>
      ) : (
        <FlashList
          data={filtered}
          renderItem={renderProduct}
          keyExtractor={keyExtractor}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingTop: exactScale(14),
            paddingBottom: adjustedBottom + exactScale(32),
          }}
        />
      )}
    </View>
  );
};
