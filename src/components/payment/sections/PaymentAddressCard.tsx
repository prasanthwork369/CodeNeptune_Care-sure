import { icons } from "@/src/constants/icons";
import { PaymentAddressCardProps } from "@/src/types/payment";
import { Touchable } from "@/src/components/ui/Touchable";
import React from "react";
import { Text, View } from "react-native";

export const PaymentAddressCard: React.FC<PaymentAddressCardProps> = ({
  hasAddress,
  deliveryLabel,
  deliveryCity,
  onPress,
}) => {
  return (
    <View style={{ marginBottom: 24 }}>
      <Text
        style={{
          fontSize: 16,
          fontFamily: "Inter_700Bold",
          color: "#1A1C1E",
          marginBottom: 12,
          marginLeft: 4,
        }}
      >
        Delivery Address
      </Text>
      <Touchable
        activeOpacity={0.85}
        onPress={onPress}
        style={{
          backgroundColor: "#fff",
          borderRadius: 20,
          padding: 16,
          flexDirection: "row",
          alignItems: "center",
          borderWidth: hasAddress ? 0 : 1.5,
          borderColor: "#FCA5A5",
          shadowColor: "#919EAB33",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.04,
          shadowRadius: 12,
          elevation: 4,
        }}
      >
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 16,
            backgroundColor: hasAddress ? "#F0FDF4" : "#FEF2F2",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <icons.location_on
            width={24}
            height={24}
            fill={hasAddress ? "#0F7635" : "#EF4444"}
          />
        </View>
        <View style={{ flex: 1, marginLeft: 16 }}>
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Inter_700Bold",
              color: "#1A1C1E",
            }}
          >
            {hasAddress
              ? (deliveryLabel ?? "Default Address")
              : "No Address Selected"}
          </Text>
          <Text
            style={{
              fontSize: 13,
              fontFamily: "Inter_500Medium",
              color: "#6B7280",
              marginTop: 4,
            }}
            numberOfLines={1}
          >
            {hasAddress ? deliveryCity! : "Please select a delivery location"}
          </Text>
        </View>
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: "#F3F4F6",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <icons.arrow_forward_ios width={12} height={12} fill="#9CA3AF" />
        </View>
      </Touchable>
    </View>
  );
};
