import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { useNav } from "@/src/hooks/useNav";
import { useCart } from "@/src/hooks/queries/useCart";
import { resolveUUID } from "@/src/utils/resolveUUID";
import { useFrequentlyOrdered } from "@/src/hooks/queries/useOrders";
import React, { useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";

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

function ProductCard({ item, index }: { item: any; index: number }) {
  const router = useNav();
  const { items: cartItems, addItem, updateItem, removeItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const productId = item.productId || item.id;
  const qty = item.lastQty ?? item.qty ?? 1;
  const cartItem = cartItems.find(
    (c: any) => c.medicineId === productId || c.metadata?.productId === productId
                || c.medicineId === item.id || c.medicineId === item.medicineId,
  );
  const [counterPending, setCounterPending] = useState(false);

  const handleCounterChange = async (newQty: number) => {
    if (!cartItem || counterPending) return;
    setCounterPending(true);
    try {
      if (newQty <= 0) await removeItem(cartItem.id);
      else await updateItem(cartItem.id, { quantity: newQty });
    } finally {
      setCounterPending(false);
    }
  };

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      const existing = cartItems.find(
        (c: any) => c.medicineId === productId || c.metadata?.productId === productId,
      );
      if (existing) {
        await updateItem(existing.id, { quantity: existing.quantity + qty });
      } else {
        const itemId = String(item.medicineId ?? item.productId ?? item.id ?? "").trim();
        if (!itemId) {
          throw new Error("[FrequentOrders] missing item id");
        }
        const slug =
          String(item.slug ?? item.productId ?? item.id ?? "").trim() || itemId;
        const name =
          String(item.name ?? item.productId ?? item.id ?? "").trim() || itemId;
        const price =
          Number(item.price ?? item.originalPrice ?? item.mrp ?? 0) ||
          Number(item.originalPrice ?? item.price ?? item.mrp ?? 0) ||
          1;

        const mrp = Number(item.originalPrice ?? item.mrp ?? price);
        const imageUri = item.image?.uri ?? (typeof item.image === 'string' ? item.image : undefined);
        const medicineId = await resolveUUID(itemId, slug, item.productId);
        if (__DEV__) console.log('[FrequentOrders] resolved:', { itemId, slug, medicineId });
        await addItem({
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
    } catch (err: any) {
      if (__DEV__) console.error("[FrequentOrders AddToCart] error:", err?.message ?? err);
      Alert.alert('Failed', err?.message ?? 'Could not add to cart. Please try again.');
    } finally {
      setIsAdding(false);
    }
  };

  const brandLine = [item.brand, item.description || item.form]
    .filter(Boolean)
    .join(" • ");

  return (
    <View
      style={{
        backgroundColor: "#fff",
        borderRadius: 16,
        marginHorizontal: 16,
        marginBottom: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: "#EEEFF1",
      }}
    >
      {/* Top row: image + info */}
      <Touchable
        activeOpacity={0.7}
        onPress={() =>
          router.push({ pathname: "/product/[id]", params: { id: productId } })
        }
        style={{ flexDirection: "row", alignItems: "flex-start" }}
      >
        {/* Product image */}
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#EEEFF1",
            backgroundColor: "#F9FAFB",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          {typeof item.image === "number" || (item.image && !item.image.uri) ? (
            <Image
              source={item.image}
              style={{ width: 54, height: 54 }}
              resizeMode="contain"
            />
          ) : item.image?.uri ? (
            <Image
              source={{ uri: item.image.uri }}
              style={{ width: 54, height: 54 }}
              resizeMode="contain"
            />
          ) : (
            <icons.placeholder width={54} height={54} />
          )}
        </View>

        {/* Name, price, brand, qty badge */}
        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter-SemiBold",
                color: "#1C2024",
                flex: 1,
                paddingRight: 8,
              }}
              numberOfLines={2}
            >
              {item.name}
            </Text>
            {/* Price */}
            <View style={{ alignItems: "flex-end" }}>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter-Bold",
                  color: "#0F7635",
                }}
              >
                ₹{Number(item.price).toFixed(1)}
              </Text>
              {!!item.originalPrice &&
                Number(item.originalPrice) > Number(item.price) && (
                  <Text
                    style={{
                      fontSize: 11,
                      fontFamily: "Inter-Regular",
                      color: "#919EAB",
                      textDecorationLine: "line-through",
                      marginTop: 2,
                    }}
                  >
                    ₹{Number(item.originalPrice).toFixed(1)}
                  </Text>
                )}
            </View>
          </View>

          {/* Brand • Pack info */}
          {!!brandLine && (
            <Text
              style={{
                fontSize: 11,
                fontFamily: "Inter-Regular",
                color: "#637381",
                marginTop: 4,
                marginBottom: 8,
              }}
              numberOfLines={1}
            >
              {brandLine}
            </Text>
          )}

          {/* Qty badge */}
          <View
            style={{
              alignSelf: "flex-start",
              borderWidth: 1,
              borderColor: "#EEEFF1",
              borderRadius: 6,
              paddingHorizontal: 10,
              paddingVertical: 3,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontFamily: "Inter-Medium",
                color: "#1C2024",
              }}
            >
              Qty: {qty}
            </Text>
          </View>
        </View>
      </Touchable>

      {/* Dashed divider */}
      <View
        style={{
          borderStyle: "dashed",
          borderWidth: 1,
          borderColor: "#EEEFF1",
          height: 0,
          marginVertical: 12,
        }}
      />

      {/* Add to cart — full width */}
      {cartItem ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', borderRadius: 10, overflow: 'hidden', backgroundColor: '#0F7635', height: 44 }}>
          <Touchable onPress={() => handleCounterChange(cartItem.quantity - 1)} disabled={counterPending} activeOpacity={0.7} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 20, color: '#fff', fontFamily: 'Inter-Medium', lineHeight: 24 }}>−</Text>
          </Touchable>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            {counterPending
              ? <ActivityIndicator size="small" color="#fff" />
              : <Text style={{ fontSize: 14, fontFamily: 'Inter-Bold', color: '#fff' }}>{cartItem.quantity}</Text>
            }
          </View>
          <Touchable onPress={() => handleCounterChange(cartItem.quantity + 1)} disabled={counterPending} activeOpacity={0.7} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 20, color: '#fff', fontFamily: 'Inter-Medium', lineHeight: 24 }}>+</Text>
          </Touchable>
        </View>
      ) : (
        <Touchable
          style={{ height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#0F763533', backgroundColor: '#fff' }}
          activeOpacity={0.6}
          onPress={handleAddToCart}
          disabled={isAdding}
        >
          {isAdding
            ? <ActivityIndicator size="small" color="#0F7635" />
            : <Text style={{ fontSize: 14, fontFamily: 'Inter-SemiBold', color: '#0F7635' }}>Add to cart</Text>
          }
        </Touchable>
      )}

      {/* Ordered X times + last ordered */}
      {(!!item.orderedTimes || !!item.lastOrdered) && (
        <View
          style={{ flexDirection: "row", alignItems: "center", marginTop: 10 }}
        >
          <icons.trend_up
            width={14}
            height={14}
            fill="#0F7635"
            style={{ marginRight: 6 }}
          />
          {!!item.orderedTimes && (
            <Text
              style={{
                fontSize: 12,
                fontFamily: "Inter-SemiBold",
                color: "#0F7635",
              }}
            >
              Ordered {item.orderedTimes} times
            </Text>
          )}
          {!!item.lastOrdered && (
            <Text
              style={{
                fontSize: 12,
                fontFamily: "Inter-Medium",
                color: "#637381",
                marginLeft: item.orderedTimes ? 8 : 0,
              }}
            >
              Last ordered: {formatDate(item.lastOrdered)}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

export const FrequentOrdersScreen: React.FC = () => {
  const router = useNav();
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
              onPress={() => router.push("/(modal)/cart")}
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
                    fontSize: 10,
                    fontFamily: "Inter-Bold",
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
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 10,
            backgroundColor: "#fff",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#F5F6FB",
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#EEEFF1",
              height: 46,
              paddingHorizontal: 12,
            }}
          >
            <icons.search width={18} height={18} style={{ marginRight: 8 }} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search your ordered products..."
              placeholderTextColor="#B0BAC4"
              style={{
                flex: 1,
                fontSize: 14,
                fontFamily: "Inter-Regular",
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
                <icons.close_small width={16} height={16} fill="#919EAB" />
              </Touchable>
            )}
          </View>
        </View>
      )}

      {/* Category filter chips */}
      {categories.length > 1 && (
        <View style={{ backgroundColor: "#fff", paddingBottom: 10 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 16,
              gap: 8,
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
                    paddingHorizontal: 16,
                    paddingVertical: 6,
                    borderRadius: 20,
                    backgroundColor: active ? "#0F7635" : "#F5F6FB",
                    borderWidth: 1,
                    borderColor: active ? "#0F7635" : "#EEEFF1",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontFamily: active ? "Inter-SemiBold" : "Inter-Medium",
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          filtered.length === 0
            ? {
                flexGrow: 1,
                justifyContent: "center",
                paddingHorizontal: 32,
                paddingBottom: 80,
              }
            : { paddingTop: 14, paddingBottom: 32 }
        }
        keyboardShouldPersistTaps="handled"
      >
        {isLoading ? (
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator size="large" color="#0F7635" />
          </View>
        ) : filtered.length === 0 ? (
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter-SemiBold",
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
                fontSize: 13,
                fontFamily: "Inter-Regular",
                color: "#919EAB",
                marginTop: 6,
                textAlign: "center",
              }}
            >
              {search || activeFilter !== "All"
                ? "Try a different name or filter"
                : "Your frequently ordered products will appear here"}
            </Text>
          </View>
        ) : (
          filtered.map((item: any, index: number) => (
            <ProductCard
              key={`${item.productId ?? item.id}-${index}`}
              item={item}
              index={index}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};
