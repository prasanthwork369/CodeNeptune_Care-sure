import { exactScale } from "@/src/utils/exactScale";
import { Touchable } from "@/src/components/ui/Touchable";
import { notifyCartError } from "@/src/utils/cartError";
import { ensureOnline } from "@/src/utils/network";
import { useAuthStore } from "@/src/store/authStore";
import React, { useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { COUNTER_BTN, COUNTER_W, cartStyles as s } from "./cart.styles";

interface CartItemCounterProps {
  item: { id: string; qty: number };
  updateItem: (itemId: string, input: { quantity: number }) => Promise<unknown>;
  removeItem: (itemId: string) => Promise<unknown>;
}

export const CartItemCounter: React.FC<CartItemCounterProps> = ({
  item,
  updateItem,
  removeItem,
}) => {
  const [isPending, setIsPending] = useState(false);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const handleChange = async (newQty: number) => {
    if (isPending) return;
    // Guest edits are local, so only a signed-in write needs the connection.
    if (isAuthenticated && !ensureOnline()) return;
    setIsPending(true);
    try {
      if (newQty <= 0) await removeItem(item.id);
      else await updateItem(item.id, { quantity: newQty });
    } catch (err) {
      notifyCartError(err);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <View
      className="flex-row items-center justify-between rounded-[6px] overflow-hidden bg-white"
      style={{ borderWidth: 1.5, borderColor: "#919EAB33", width: COUNTER_W }}
    >
      <Touchable
        onPress={() => handleChange(item.qty - 1)}
        disabled={isPending}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={
          item.qty === 1 ? "Remove item from cart" : "Decrease quantity"
        }
        accessibilityState={{ disabled: isPending }}
        style={{
          width: COUNTER_BTN,
          paddingVertical: exactScale(8),
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={s.counterPlusMinus}
          className="font-inter-medium text-brand-text leading-none"
        >
          −
        </Text>
      </Touchable>
      <View
        accessible
        accessibilityRole="text"
        accessibilityLabel={`Quantity ${item.qty}`}
        style={{
          flex: 1,
          paddingVertical: exactScale(8),
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isPending ? (
          <ActivityIndicator size="small" color="#222222" />
        ) : (
          <Text
            style={s.counterVal}
            className="font-inter-bold text-brand-text text-center"
            numberOfLines={1}
          >
            {item.qty}
          </Text>
        )}
      </View>
      <Touchable
        onPress={() => handleChange(item.qty + 1)}
        disabled={isPending}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Increase quantity"
        accessibilityState={{ disabled: isPending }}
        style={{
          width: COUNTER_BTN,
          paddingVertical: exactScale(8),
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={s.counterPlusMinus}
          className="font-inter-medium text-brand-text leading-none"
        >
          +
        </Text>
      </Touchable>
    </View>
  );
};
