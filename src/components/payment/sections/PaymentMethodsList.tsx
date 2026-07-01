import { PaymentMethodsListProps } from "@/src/types/payment";
import { LinearGradient } from "expo-linear-gradient";
import { Touchable } from "@/src/components/ui/Touchable";
import React from "react";
import { Text, View } from "react-native";
import { exactScale, moderateScale } from "@/src/utils/exactScale";

const RadioDot = ({ selected }: { selected: boolean }) => (
  <View
    style={{
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: selected ? "#0F7635" : "#E5E7EB",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#fff",
    }}
  >
    {selected && (
      <LinearGradient
        colors={["#0F7635", "#22C55E"]}
        style={{ width: 12, height: 12, borderRadius: 6 }}
      />
    )}
  </View>
);

export const PaymentMethodsList: React.FC<PaymentMethodsListProps> = ({
  methods,
  selectedId,
  onSelect,
}) => {
  return (
    <View>
      <Text
        style={{
          fontSize: moderateScale(16),
          fontWeight: "700",
          color: "#1A1C1E",
          marginBottom: exactScale(12),
          marginLeft: exactScale(4),
        }}
      >
        Payment Method
      </Text>
      <View style={{ gap: exactScale(12) }}>
        {methods.map((method) => (
          <Touchable
            key={method.id}
            activeOpacity={0.85}
            onPress={() => onSelect(method.id)}
            style={{
              backgroundColor: "#fff",
              borderRadius: 20,
              padding: exactScale(16),
              flexDirection: "row",
              alignItems: "center",
              borderWidth: selectedId === method.id ? 2 : 0,
              borderColor: "#0F7635",
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
                backgroundColor: "#F0FDF4",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {method.icon}
            </View>
            <View style={{ flex: 1, marginLeft: exactScale(16) }}>
              <Text
                style={{
                  fontSize: moderateScale(15),
                  fontWeight: "700",
                  color: "#1A1C1E",
                }}
              >
                {method.title}
              </Text>
              <Text
                style={{
                  fontSize: moderateScale(12),
                  fontWeight: "500",
                  color: "#6B7280",
                  marginTop: exactScale(4),
                }}
              >
                {method.subtitle}
              </Text>
            </View>
            <RadioDot selected={selectedId === method.id} />
          </Touchable>
        ))}
      </View>
    </View>
  );
};
