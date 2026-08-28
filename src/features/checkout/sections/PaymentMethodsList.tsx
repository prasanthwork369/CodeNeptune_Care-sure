import type { PaymentMethodsListProps } from "../types";
import { LinearGradient } from "expo-linear-gradient";
import { Touchable } from "@/src/components/ui/Touchable";
import React from "react";
import { Text, View } from "react-native";
import { styles as s } from "./PaymentMethodsList.styles";

const RadioDot = ({ selected }: { selected: boolean }) => (
  <View
    style={[
      s.radioOuter,
      selected ? s.radioOuterSelected : s.radioOuterUnselected,
    ]}
  >
    {selected && (
      <LinearGradient
        colors={["#0F7635", "#22C55E"]}
        style={s.radioInner}
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
      <Text style={s.heading}>Payment Method</Text>
      <View style={s.listWrap}>
        {methods.map((method) => {
          const isSelected = selectedId === method.id;
          return (
            <Touchable
              key={method.id}
              activeOpacity={0.85}
              onPress={() => onSelect(method.id)}
              style={[
                s.methodCard,
                isSelected ? s.methodCardSelected : s.methodCardUnselected,
              ]}
            >
              <View style={s.iconBox}>{method.icon}</View>
              <View style={s.infoCol}>
                <Text style={s.title}>{method.title}</Text>
                <Text style={s.subtitle}>{method.subtitle}</Text>
              </View>
              <RadioDot selected={isSelected} />
            </Touchable>
          );
        })}
      </View>
    </View>
  );
};
