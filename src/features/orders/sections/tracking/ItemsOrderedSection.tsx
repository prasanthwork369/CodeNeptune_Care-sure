import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { useNav } from "@/src/hooks/useNav";
import { OrderItem } from "../../types";
import { exactScale } from "@/src/utils/exactScale";
import { getOrderItemPricing } from "@/src/utils/order";
import { Image } from "expo-image";
import { SectionCard } from "./SectionCard";
import { styles as s } from "./tracking.styles";
import React from "react";
import { Text, View } from "react-native";

interface ItemsOrderedSectionProps {
  items: OrderItem[];
  orderId: string | undefined;
  priceEstimateRatio?: number;
  actionsDisabled?: boolean;
  showReturnButton?: boolean;
  returnDeadlineLabel?: string | null;
  hasActiveReturnRequest?: boolean;
  isCancellable?: boolean;
}

export function ItemsOrderedSection({
  items,
  orderId,
  priceEstimateRatio,
  actionsDisabled,
  showReturnButton,
  returnDeadlineLabel,
  hasActiveReturnRequest,
  isCancellable,
}: ItemsOrderedSectionProps) {
  const router = useNav();

  return (
    <SectionCard>
      <View style={s.itemsHeaderRow}>
        <Text style={s.itemsHeaderTitle}>
          Items Ordered ({items.length})
        </Text>
        <View style={s.actionBtnsRow}>
          {hasActiveReturnRequest && !actionsDisabled && (
            <View style={s.activeReturnPill}>
              <Text style={s.activeReturnPillText}>
                Return Request Already Exists
              </Text>
            </View>
          )}
          {showReturnButton && !actionsDisabled && !hasActiveReturnRequest && (
            <View style={s.returnBtnCol}>
              <Touchable
                style={s.returnBtn}
                activeOpacity={0.7}
                onPress={() =>
                  router.push({
                    pathname: "/profile/orders/return",
                    params: { orderId },
                  })
                }
              >
                <icons.return_pack
                  width={exactScale(14)}
                  height={exactScale(14)}
                />
                <Text style={s.returnBtnText}>
                  Return
                </Text>
              </Touchable>
              {!!returnDeadlineLabel && (
                <Text style={s.returnDeadlineBadge}>
                  Returnable until {returnDeadlineLabel}
                </Text>
              )}
            </View>
          )}
          {isCancellable && !actionsDisabled && (
            <Touchable
              style={s.cancelBtn}
              activeOpacity={0.7}
              onPress={() =>
                router.push({
                  pathname: "/profile/orders/cancel",
                  params: { orderId },
                })
              }
            >
              <Text style={s.cancelBtnText}>
                Cancel Order
              </Text>
            </Touchable>
          )}
        </View>
      </View>
      {items.map((item, index, arr) => {
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
                  });
              }}
              style={s.itemRow}
            >
              <View style={s.itemImageBox}>
                {item.medicineSnapshot?.image ? (
                  <Image
                    source={{ uri: item.medicineSnapshot.image }}
                    style={s.itemImg}
                    contentFit="contain"
                    cachePolicy="memory-disk"
                  />
                ) : (
                  <icons.placeholder
                    width={exactScale(50)}
                    height={exactScale(50)}
                  />
                )}
              </View>
              <View style={s.itemInfoCol}>
                <View style={s.itemTitlePriceRow}>
                  <Text
                    style={s.itemNameText}
                    numberOfLines={2}
                  >
                    {item.medicineSnapshot?.name ?? item.medicineId}
                  </Text>
                  <View style={s.itemPriceCol}>
                    <Text style={s.itemSellingPrice}>
                      {sellingPrice
                        ? `₹${parseFloat((sellingPrice * item.quantity).toFixed(2))}`
                        : "—"}
                    </Text>
                    {hasDiscount && (
                      <Text style={s.itemMrpPrice}>
                        ₹{parseFloat((mrp * item.quantity).toFixed(2))}
                      </Text>
                    )}
                  </View>
                </View>
                {(item.medicineSnapshot?.brand ||
                  item.medicineSnapshot?.pack) && (
                  <Text style={s.itemMetaText}>
                    {[item.medicineSnapshot.brand, item.medicineSnapshot.pack]
                      .filter(Boolean)
                      .join(" • ")}
                  </Text>
                )}
                <View style={s.itemQtyDiscountRow}>
                  <View style={s.qtyBadge}>
                    <Text style={s.qtyBadgeText}>
                      Qty: {item.quantity}
                    </Text>
                  </View>

                  {hasDiscount && (
                    <Text style={s.discountPercentText}>
                      {parseFloat(discountPercent.toFixed(2))}% off
                    </Text>
                  )}
                </View>
              </View>
            </Touchable>
            {index < arr.length - 1 && (
              <View style={s.itemDivider} />
            )}
          </View>
        );
      })}
    </SectionCard>
  );
}
