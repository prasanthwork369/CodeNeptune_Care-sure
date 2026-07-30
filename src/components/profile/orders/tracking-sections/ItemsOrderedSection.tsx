import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { useNav } from "@/src/hooks/useNav";
import { OrderItem } from "@/src/types/order";
import { exactScale } from "@/src/utils/exactScale";
import { getOrderItemPricing } from "@/src/utils/order";
import { Image } from "expo-image";
import React from "react";
import { Text, View } from "react-native";
import { orderStyles as s } from "../orders.styles";
import { SectionCard } from "./SectionCard";

interface ItemsOrderedSectionProps {
  items: OrderItem[];
  orderId: string | undefined;
  orderStatus?: number;
  isCancelling: boolean;
  // paid itemTotal / MRP total; used only to estimate a missing selling price.
  // It must never be displayed as an individual item's discount percentage.
  priceEstimateRatio?: number;
}

export function ItemsOrderedSection({
  items,
  orderId,
  orderStatus,
  isCancelling,
  priceEstimateRatio,
}: ItemsOrderedSectionProps) {
  const router = useNav();

  return (
    <SectionCard>
      <View
        className="flex-row items-center justify-between"
        style={{
          paddingHorizontal: exactScale(16),
          paddingTop: exactScale(16),
          paddingBottom: exactScale(12),
        }}
      >
        <Text style={s.labelMd} className="font-inter-bold text-brand-text">
          Items Ordered ({items.length})
        </Text>
        <View className="flex-row" style={{ gap: exactScale(8) }}>
          {orderStatus === 7 && (
            <Touchable
              className="flex-row items-center"
              style={{
                borderWidth: exactScale(1.33),
                borderColor: "#FDE047",
                backgroundColor: "#FEF9C3",
                borderRadius: exactScale(20),
                paddingHorizontal: exactScale(12),
                paddingVertical: exactScale(4),
              }}
              activeOpacity={0.7}
              onPress={() =>
                router.push({
                  pathname: "/profile/orders/return",
                  params: { orderId },
                } as any)
              }
            >
              <icons.return_pack
                width={exactScale(14)}
                height={exactScale(14)}
              />
              <Text
                style={[s.labelSm, { marginLeft: exactScale(6) }]}
                className="font-inter-semibold text-brand-text"
              >
                Return
              </Text>
            </Touchable>
          )}
          {orderStatus !== 7 && orderStatus !== 0 && (
            <Touchable
              className="flex-row items-center"
              style={{
                borderWidth: exactScale(1.33),
                borderColor: "#515F0014",
                backgroundColor: "#FFFFDC",
                borderRadius: exactScale(20),
                paddingHorizontal: exactScale(12),
                paddingVertical: exactScale(4),
                shadowColor: "#000000",
                shadowOffset: { width: 0, height: exactScale(5.33) },
                shadowOpacity: 0.05,
                shadowRadius: exactScale(32),
              }}
              activeOpacity={0.7}
              onPress={() =>
                router.push({
                  pathname: "/profile/orders/cancel",
                  params: { orderId },
                } as any)
              }
              disabled={isCancelling}
            >
              <Text
                style={[s.labelSm, { marginLeft: exactScale(6) }]}
                className="font-inter-semibold text-brand-text"
              >
                {isCancelling ? "Cancelling..." : "Cancel Order"}
              </Text>
            </Touchable>
          )}
        </View>
      </View>
      {items.map((item, index, arr) => {
        // unitPrice is stored as the MRP — derive the discounted price paid.
        const { sellingPrice, mrp, discountPercent } = getOrderItemPricing(
          item,
          priceEstimateRatio,
        );
        const hasDiscount = discountPercent > 0;
        return (
          <View key={item.id}>
            <Touchable
              activeOpacity={0.7}
              onPress={() => {
                const productId =
                  item.productId ||
                  item.medicineSnapshot?.productId ||
                  item.medicineSnapshot?.slug ||
                  item.medicineId;
                if (productId)
                  router.push({
                    pathname: "/product/[id]",
                    params: { id: productId },
                  } as any);
              }}
              className="flex-row"
              style={{
                paddingHorizontal: exactScale(16),
                paddingVertical: exactScale(12),
              }}
            >
              <View
                className="border border-[#919EAB33] bg-[#FAFAFA] items-center justify-center overflow-hidden"
                style={{
                  width: exactScale(72),
                  height: exactScale(72),
                  borderRadius: exactScale(8),
                  marginRight: exactScale(12),
                }}
              >
                {item.medicineSnapshot?.image ? (
                  <Image
                    source={{ uri: item.medicineSnapshot.image }}
                    style={s.productImg50}
                    contentFit="contain"
                  />
                ) : (
                  <icons.placeholder
                    width={exactScale(50)}
                    height={exactScale(50)}
                  />
                )}
              </View>
              <View className="flex-1">
                <View className="flex-row justify-between items-start">
                  <Text
                    style={[s.labelSm, { paddingRight: exactScale(8) }]}
                    className="font-inter-semibold text-brand-text flex-1"
                    numberOfLines={2}
                  >
                    {item.medicineSnapshot?.name ?? item.medicineId}
                  </Text>
                  <View className="items-end">
                    <Text
                      style={s.labelSm}
                      className="font-inter-bold text-brand-text"
                    >
                      {sellingPrice
                        ? `₹${parseFloat((sellingPrice * item.quantity).toFixed(2))}`
                        : "—"}
                    </Text>
                    {/* Only show the struck-through MRP when there's an actual
                      discount (mrp > selling price) — otherwise it renders a
                      strikethrough over the same price on non-discounted items. */}
                    {hasDiscount && (
                      <Text
                        style={[s.statusBadge, { marginTop: exactScale(2) }]}
                        className="font-inter text-brand-subtext line-through"
                      >
                        ₹{parseFloat((mrp * item.quantity).toFixed(2))}
                      </Text>
                    )}
                  </View>
                </View>
                {(item.medicineSnapshot?.brand ||
                  item.medicineSnapshot?.pack) && (
                  <Text
                    style={[s.labelSm, { marginTop: exactScale(2) }]}
                    className="font-inter-medium text-brand-subtext"
                  >
                    {[item.medicineSnapshot.brand, item.medicineSnapshot.pack]
                      .filter(Boolean)
                      .join(" • ")}
                  </Text>
                )}
                <View
                  className="flex-row items-center justify-between"
                  style={{ marginTop: exactScale(8) }}
                >
                  <View
                    style={{
                      borderWidth: exactScale(1),
                      borderColor: "#E2E8F0",
                      backgroundColor: "#F3F4F6",
                      borderRadius: exactScale(4),
                      paddingHorizontal: exactScale(10),
                      paddingVertical: exactScale(2),
                    }}
                  >
                    <Text
                      style={s.statusBadge}
                      className="font-inter-semibold text-brand-text"
                    >
                      Qty: {item.quantity}
                    </Text>
                  </View>

                  {/* Discount % on the right — show the stored discount directly
                    (like the web) so it matches the product page exactly, rather
                    than re-deriving it from the rounded paid price. */}
                  {hasDiscount && (
                    <Text
                      style={s.labelSm}
                      className="font-inter-bold text-brand-primary"
                    >
                      {parseFloat(discountPercent.toFixed(2))}% off
                    </Text>
                  )}
                </View>
              </View>
            </Touchable>
            {index < arr.length - 1 && (
              <View
                style={{
                  borderTopWidth: 1,
                  borderColor: "#E5E7EB",
                  marginHorizontal: exactScale(20),
                  borderStyle: "dashed",
                }}
              />
            )}
          </View>
        );
      })}
    </SectionCard>
  );
}
