import { exactScale } from "@/src/utils/exactScale";
import React from "react";
import { View, Text } from "react-native";
import { cartStyles as s } from "../cart.styles";
import { LinearGradient } from "expo-linear-gradient";
import { icons } from "@/src/constants/icons";
import { CartFreeDeliveryProgressProps } from "@/src/types/cart";

export const CartFreeDeliveryProgress: React.FC<
  CartFreeDeliveryProgressProps
> = ({ remainingForFreeDelivery, progress }) => {
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round(progress * 100)),
  );

  return (
    <LinearGradient
      colors={["#FFF6ED", "#FFFFFF"]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={{
        marginHorizontal: exactScale(16),
        marginTop: exactScale(12),
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#919EAB33",
      }}
    >
      <View
        style={{
          paddingHorizontal: exactScale(16),
          paddingVertical: exactScale(16),
        }}
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={
          remainingForFreeDelivery > 0
            ? `Shop ₹${Number(remainingForFreeDelivery).toFixed(2)} more for free delivery`
            : "Free delivery unlocked"
        }
        accessibilityValue={{ min: 0, max: 100, now: progressPercent }}
      >
        <View className="flex-row items-center">
          <icons.moped_package width={exactScale(22)} height={exactScale(20)} />
          <Text
            style={[s.progressText, { marginLeft: exactScale(8) }]}
            className="font-inter-medium text-[#1A1C1E]"
          >
            {remainingForFreeDelivery > 0 ? (
              <>
                Shop{" "}
                <Text className="font-inter-extrabold">
                  ₹{Number(remainingForFreeDelivery).toFixed(2)}
                </Text>{" "}
                more to free delivery
              </>
            ) : (
              <Text className="font-inter-semibold">
                {"You've unlocked free delivery!"}
              </Text>
            )}
          </Text>
        </View>
        <View
          style={{ height: exactScale(6), marginTop: exactScale(12) }}
          className="bg-[#F1E2C9] rounded-full overflow-hidden"
        >
          <View
            className="h-full bg-[#0B0D10] rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </View>
      </View>
    </LinearGradient>
  );
};
